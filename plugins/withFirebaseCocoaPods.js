const { withPodfile } = require("expo/config-plugins");

/** Firebase's automatic SPM libraries conflict with static frameworks. */
module.exports = function withFirebaseCocoaPods(config) {
  return withPodfile(config, (mod) => {
    let contents = mod.modResults.contents;
    // Keep this idempotent when prebuild runs against an existing native project.
    contents = contents.replace(/^\s*\$RNFirebase(?:DisableSPM|AsStaticFramework)\s*=.*\r?\n/gm, "\n");
    mod.modResults.contents =
      "$RNFirebaseDisableSPM = true\n" +
      "$RNFirebaseAsStaticFramework = true\n\n" +
      contents;
    return mod;
  });
};
