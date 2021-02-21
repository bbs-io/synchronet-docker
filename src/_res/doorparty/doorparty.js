/**
 * ~/sbbs/mods/doorparty.js
 * https://raw.githubusercontent.com/echicken/dpc2/master/third_party/synchronet/doorparty.js
 *
 * originally from: https://github.com/echicken/dpc2
 *
 * Modified to default to host: "doorparty", port: 513
 * This is what the `sbbs doorparty` command will use/configure
 */
load("sbbsdefs.js");
var userprops = load({}, "userprops.js");
var cfg = load({}, "modopts.js", "doorparty") || {};

var attr = console.attributes;

function make_password() {
  var c;
  var p = [];
  while (p.length < 8) {
    c = ascii(Math.ceil(Math.random() * 58) + 32);
    if (p.indexOf(c) > -1) continue;
    p.push(c);
  }
  return p.join("");
}

function get_password() {
  if (cfg.password) return cfg.password; // If a system-wide password has been set, use it
  var password = userprops.get("doorparty", "password", "");
  if (password != "") return password; // If the user has a DoorParty password on file, use it
  password = make_password();
  userprops.set("doorparty", "password", password); // Store a DoorParty password for this user
  return password;
}

console.clear(LIGHTGRAY);
console.putmsg("Connecting to DoorParty, please wait ...");

bbs.rlogin_gate(
  (cfg.tunnel_host || "localhost") + ":" + (cfg.tunnel_port || 9999),
  get_password(), // password
  user.alias,
  argv.length ? argv[0] : undefined
);

console.attributes = attr;
console.clear();
