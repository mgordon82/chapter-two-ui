#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(HealthKitPlugin, "HealthKit",
  CAP_PLUGIN_METHOD(requestHealthPermissions, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getLatestWeight, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getWeightSamples, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getDailyStepTotals, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getDailyWaterTotals, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(getWorkoutSamples, CAPPluginReturnPromise);
)
