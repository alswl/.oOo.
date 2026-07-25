let {classes: Cc, interfaces: Ci, utils: Cu} = Components
function startup() {
  Cu.import('resource://gre/modules/Services.jsm')
  Cu.import('resource://gre/modules/devtools/Console.jsm')
  let apiPref = 'extensions.VimFx.api_url'
  let apiUrl = Services.prefs.getComplexValue(apiPref, Ci.nsISupportsString).data
  Cu.import(apiUrl, {}).getAPI(vimfx => {
    let path = __SCRIPT_URI_SPEC__.replace('bootstrap.js', 'vimfx.js')
    let scope = {Cc, Ci, Cu, vimfx}
    Services.scriptloader.loadSubScript(path, scope, 'UTF-8')
  })
}
function shutdown() {}
function install() {}
function uninstall() {}