import Foundation
import Capacitor
import HealthKit

@objc(HealthKitPlugin)
public class HealthKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "HealthKitPlugin"
    public let jsName = "HealthKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestHealthPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getLatestWeight", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getWeightSamples", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getDailyStepTotals", returnType: CAPPluginReturnPromise)
    ]

    private let healthStore = HKHealthStore()

    @objc func requestHealthPermissions(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("HealthKit is not available on this device.")
            return
        }

        var readTypes = Set<HKObjectType>()

        if let bodyMass = HKObjectType.quantityType(forIdentifier: .bodyMass) {
            readTypes.insert(bodyMass)
        }

        if let stepCount = HKObjectType.quantityType(forIdentifier: .stepCount) {
            readTypes.insert(stepCount)
        }

        readTypes.insert(HKObjectType.workoutType())

        healthStore.requestAuthorization(toShare: nil, read: readTypes) { success, error in
            DispatchQueue.main.async {
                if let error = error {
                    call.reject("HealthKit permission failed: \(error.localizedDescription)")
                    return
                }

                call.resolve([
                    "granted": success
                ])
            }
        }
    }

    @objc func getLatestWeight(_ call: CAPPluginCall) {
        guard let bodyMassType = HKObjectType.quantityType(forIdentifier: .bodyMass) else {
            call.reject("Body mass type is unavailable.")
            return
        }

        let sortDescriptor = NSSortDescriptor(
            key: HKSampleSortIdentifierEndDate,
            ascending: false
        )

        let query = HKSampleQuery(
            sampleType: bodyMassType,
            predicate: nil,
            limit: 1,
            sortDescriptors: [sortDescriptor]
        ) { _, samples, error in
            DispatchQueue.main.async {
                if let error = error {
                    call.reject("Failed to fetch latest weight: \(error.localizedDescription)")
                    return
                }

                guard let sample = samples?.first as? HKQuantitySample else {
                    call.resolve([
                        "valueKg": NSNull(),
                        "valueLb": NSNull(),
                        "recordedAt": NSNull(),
                        "sampleId": NSNull(),
                        "source": [
                            "integration": "apple_health",
                            "appSourceName": NSNull(),
                            "deviceSourceName": NSNull()
                        ]
                    ])
                    return
                }

                let kg = sample.quantity.doubleValue(for: HKUnit.gramUnit(with: .kilo))
                let lb = sample.quantity.doubleValue(for: HKUnit.pound())

                let roundedKg = (kg * 100).rounded() / 100
                let roundedLb = (lb * 100).rounded() / 100

                let sourceRevision = sample.sourceRevision
                let appSourceName = sourceRevision.source.name

                let deviceSourceName: String?
                if let productType = sample.device?.model {
                    deviceSourceName = productType
                } else if let localDeviceName = sample.device?.name {
                    deviceSourceName = localDeviceName
                } else {
                    deviceSourceName = nil
                }

                let source: [String: Any] = [
                    "integration": "apple_health",
                    "appSourceName": appSourceName,
                    "deviceSourceName": deviceSourceName ?? NSNull()
                ]

                let response: [String: Any] = [
                    "valueKg": roundedKg,
                    "valueLb": roundedLb,
                    "recordedAt": ISO8601DateFormatter().string(from: sample.endDate),
                    "sampleId": sample.uuid.uuidString,
                    "source": source
                ]

                call.resolve(response)
            }
        }

        healthStore.execute(query)
    }
    @objc func getWeightSamples(_ call: CAPPluginCall) {
        guard let bodyMassType = HKObjectType.quantityType(forIdentifier: .bodyMass) else {
            call.reject("Body mass type is unavailable.")
            return
        }

        let startDateString = call.getString("startDate")
        let limit = call.getInt("limit") ?? 500

        let parseFormatter = ISO8601DateFormatter()
        parseFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        let outputFormatter = ISO8601DateFormatter()

        let startDate: Date
        if let startDateString {
            if let parsedDate = parseFormatter.date(from: startDateString) ??
                outputFormatter.date(from: startDateString) {
                startDate = parsedDate
            } else {
                guard let fallback = Calendar.current.date(byAdding: .year, value: -1, to: Date()) else {
                    call.reject("Could not determine fallback start date.")
                    return
                }
                startDate = fallback
            }
        } else {
            guard let fallback = Calendar.current.date(byAdding: .year, value: -1, to: Date()) else {
                call.reject("Could not determine fallback start date.")
                return
            }
            startDate = fallback
        }

        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: Date(),
            options: .strictStartDate
        )

        let sortDescriptor = NSSortDescriptor(
            key: HKSampleSortIdentifierEndDate,
            ascending: false
        )

        let query = HKSampleQuery(
            sampleType: bodyMassType,
            predicate: predicate,
            limit: limit,
            sortDescriptors: [sortDescriptor]
        ) { _, samples, error in
            DispatchQueue.main.async {
                if let error = error {
                    call.reject("Failed to fetch weight samples: \(error.localizedDescription)")
                    return
                }

                let quantitySamples = (samples as? [HKQuantitySample]) ?? []

                let items: [[String: Any]] = quantitySamples.map { sample in
                    let kg = sample.quantity.doubleValue(for: HKUnit.gramUnit(with: .kilo))
                    let lb = sample.quantity.doubleValue(for: HKUnit.pound())

                    let roundedKg = (kg * 100).rounded() / 100
                    let roundedLb = (lb * 100).rounded() / 100

                    let sourceRevision = sample.sourceRevision
                    let appSourceName = sourceRevision.source.name

                    let deviceSourceName: String?
                    if let model = sample.device?.model {
                        deviceSourceName = model
                    } else if let name = sample.device?.name {
                        deviceSourceName = name
                    } else {
                        deviceSourceName = nil
                    }

                    let source: [String: Any] = [
                        "integration": "apple_health",
                        "appSourceName": appSourceName,
                        "deviceSourceName": deviceSourceName ?? NSNull()
                    ]

                    let item: [String: Any] = [
                        "sampleId": sample.uuid.uuidString,
                        "valueKg": roundedKg,
                        "valueLb": roundedLb,
                        "recordedAt": outputFormatter.string(from: sample.endDate),
                        "source": source
                    ]

                    return item
                }

                call.resolve([
                    "items": items
                ])
            }
        }

        healthStore.execute(query)
    }
    @objc func getDailyStepTotals(_ call: CAPPluginCall) {
        guard let stepType = HKObjectType.quantityType(forIdentifier: .stepCount) else {
            call.reject("Step count type is unavailable.")
            return
        }

        let startDateString = call.getString("startDate")
        let limit = call.getInt("limit") ?? 30

        let parseFormatter = ISO8601DateFormatter()
        parseFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        let outputFormatter = ISO8601DateFormatter()
        outputFormatter.formatOptions = [.withFullDate]

        let calendar = Calendar.current

        let resolvedStartDate: Date
        if let startDateString {
            if let parsedDate = parseFormatter.date(from: startDateString) ??
                ISO8601DateFormatter().date(from: startDateString) {
                resolvedStartDate = parsedDate
            } else {
                guard let fallback = calendar.date(byAdding: .day, value: -30, to: Date()) else {
                    call.reject("Could not determine fallback start date.")
                    return
                }
                resolvedStartDate = fallback
            }
        } else {
            guard let fallback = calendar.date(byAdding: .day, value: -30, to: Date()) else {
                call.reject("Could not determine fallback start date.")
                return
            }
            resolvedStartDate = fallback
        }

        let startOfDay = calendar.startOfDay(for: resolvedStartDate)
        let endDate = Date()

        var interval = DateComponents()
        interval.day = 1

        let predicate = HKQuery.predicateForSamples(
            withStart: startOfDay,
            end: endDate,
            options: .strictStartDate
        )

        let query = HKStatisticsCollectionQuery(
            quantityType: stepType,
            quantitySamplePredicate: predicate,
            options: .cumulativeSum,
            anchorDate: startOfDay,
            intervalComponents: interval
        )

        query.initialResultsHandler = { _, results, error in
            DispatchQueue.main.async {
                if let error = error {
                    call.reject("Failed to fetch daily step totals: \(error.localizedDescription)")
                    return
                }

                guard let results = results else {
                    call.resolve(["items": []])
                    return
                }

                var items: [[String: Any]] = []

                results.enumerateStatistics(from: startOfDay, to: endDate) { statistics, _ in
                    let stepCount = statistics.sumQuantity()?.doubleValue(for: HKUnit.count()) ?? 0
                    let roundedSteps = Int(stepCount.rounded())

                    let item: [String: Any] = [
                        "date": outputFormatter.string(from: statistics.startDate),
                        "steps": roundedSteps,
                        "source": [
                            "integration": "apple_health"
                        ]
                    ]

                    items.append(item)
                }

                let limitedItems = Array(items.suffix(limit))

                call.resolve([
                    "items": limitedItems
                ])
            }
        }

        healthStore.execute(query)
    }
}
