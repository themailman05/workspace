import { HardhatRuntimeEnvironment } from "hardhat/types";
import { formatEther, parseEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";

export interface Configuration {
  targetNAV: BigNumber;
  core: {
    SetTokenCreator: {
      address: string;
    };
    modules: {
      [key: string]: {
        address: string;
      };
    };
  };
  components: {
    [key: string]: {
      ratio: number; // percent of targetNAV (out of 100)
      address: string;
      oracle: string;
    };
  };
}

export const DefaultConfiguration: Configuration = {
  targetNAV: parseEther("100"),
  core: {
    SetTokenCreator: {
      address: process.env.ADDR_SET_SET_TOKEN_CREATOR,
    },
    modules: {
      BasicIssuanceModule: {
        address: process.env.ADDR_SET_BASIC_ISSUANCE_MODULE,
      },
      StreamingFeeModule: {
        address: process.env.ADDR_SET_STREAMING_FEE_MODULE,
      },
    },
  },
  components: {
    ycrvDUSD: {
      ratio: 25,
      address: process.env.ADDR_YEARN_CRVDUSD,
      oracle: process.env.ADDR_CURVE_CRVDUSD,
    },
    ycrvFRAX: {
      ratio: 25,
      address: process.env.ADDR_YEARN_CRVFRAX,
      oracle: process.env.ADDR_CURVE_CRVFRAX,
    },
    ycrvUSDN: {
      ratio: 25,
      address: process.env.ADDR_YEARN_CRVUSDN,
      oracle: process.env.ADDR_CURVE_CRVUSDN,
    },
    ycrvUST: {
      ratio: 25,
      address: process.env.ADDR_YEARN_CRVUST,
      oracle: process.env.ADDR_CURVE_CRVUST,
    },
  },
};

interface TokenSetCreator {
  _calculateUnits(
    component: Configuration["components"][0]
  ): Promise<BigNumber>;
  run: () => Promise<void>;
}

interface Args {
  configuration?: Configuration;
  debug?: boolean;
  hre: HardhatRuntimeEnvironment;
}

export default function TokenSetCreator({
  configuration,
  debug,
  hre,
}: Args): TokenSetCreator {
  
  const { components, targetNAV } = configuration
    ? configuration
    : DefaultConfiguration;

  return {
    _calculateUnits: async function (
      component: Configuration["components"][0]
    ): Promise<BigNumber> {
      const yVault = await hre.ethers.getContractAt(
        "MockYearnV2Vault",
        component.address
      );

      const curveLP = await hre.ethers.getContractAt(
        "MockCurveMetapool",
        component.oracle
      );

      const targetComponentValue = targetNAV
        .mul(parseEther(component.ratio.toString()))
        .div(parseEther("100"));

      const pricePerShare = (await yVault.pricePerShare()) as BigNumber;
      const virtualPrice = (await curveLP.get_virtual_price()) as BigNumber;

      const targetCrvLPUnits = targetComponentValue
        .mul(parseEther("1"))
        .div(virtualPrice);

      const targetComponentUnits = targetCrvLPUnits
        .mul(parseEther("1"))
        .div(pricePerShare);

      if (debug) {
        console.log({
          targetNAV: formatEther(targetNAV),
          targetComponentValue: formatEther(targetComponentValue),
          pricePerShare: formatEther(pricePerShare),
          virtualPrice: formatEther(virtualPrice),
          targetCrvLPUnits: formatEther(targetCrvLPUnits),
          targetComponentUnits: formatEther(targetComponentUnits),
        });
      }

      return targetComponentUnits;
    },

    run: async function (): Promise<void> {
      const [manager] = await hre.ethers.getSigners();
      const SetTokenCreator = await hre.ethers.getContractAt(
        "SetTokenCreator",
        configuration.core.SetTokenCreator.address
      );

      const setComponents = Object.keys(components).map(
        (component) => components[component]
      );

      const setModules = Object.keys(configuration.core.modules).map(
        (module) => configuration.core.modules[module]
      );

      SetTokenCreator.create(
        setComponents.map((component) => component.address),
        setComponents.map((component) => this._calculateUnits(component)),
        setModules.map((module) => module.address),
        manager.address,
        "High-Yield Small Cap Stablecoin Index",
        "HYSI"
      );
    },
  };
}
