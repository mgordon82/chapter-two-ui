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
        CAPPluginMethod(name: "getWeightSamples", returnType: CAPPluginReturnPromise)
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
}
