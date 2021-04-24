require("dotenv").config({ path: "../../.env" });

switch(process.env.ENV) {
  case "mainnet":
    require('dotenv').config({path: "../../.env.mainnet"});
    break;
  case "rinkeby":
    require('dotenv').config({ path: "../../.env.rinkeby"});
    break;
  case "local":
    require('dotenv').config({path: "../../.env.local"});
    break;
}