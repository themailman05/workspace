import React, { useEffect, useState } from 'react';
import { Container, Box, Link, Button, Grid, TextField, Typography, makeStyles } from '@material-ui/core';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector, NoEthereumProviderError } from '@web3-react/injected-connector';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { abi as PrivateSaleABI } from '../../../private_sale/artifacts/contracts/PrivateSale.sol/PrivateSale.json';
import { abi as ERC20ABI } from '@openzeppelin/contracts/build/contracts/ERC20.json';

const USDC_ADDRESS = "0xcA8bfC4D2a7d7ec9B6326121562062E70049dFb0";
const PRIVATE_SALE_ADDRESS = "0xCcDf1Cb5ab599dd62AD2F176827DA07B24DB093d";

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.primary.dark,
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  logo: {
    marginTop: "10px",
    height: '70px',
  },
  logomark: {
    marginTop: '20px',
    height: '170px',
  },
  logomarkSmall: {
    height: '120px',
  },
  button: {
    background: "#fff",
    color: "#000",
    '&:hover': {
      color:
        "#fff"
    },
  },
  heroContent: {
    color: "#fff",
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  p: {
    fontWeight: 200,
  },
  footer: {
    display: 'none',
    backgroundColor: "#fff",
    backgroundFilter: 'blur(3px)',
    padding: theme.spacing(6),
  },
}));


export const Purchase = () => {
  const classes = useStyles();
  const [isParticipant, setIsParticipant] = useState(false);
  const [account, setAccount] = useState("");
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasProvider, setHasProvider] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [purchaseAmount, setPurchaseAmount] = useState(25000);
  const [isTxPending, setIsTxPending] = useState(false);
  const web3React = useWeb3React();
  const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

  const connectWallet = () => {
    const injectedConnector = new InjectedConnector({
      supportedChainIds: [
        1, // Mainet
        3, // Ropsten
        4, // Rinkeby
        5, // Goerli
        42, // Kovan
      ]
    });
    web3React.activate(injectedConnector);
  }

  const approvePurchase = () => {
    const usdc = getUsdcContract();
    const privateSale = getPrivateSaleContract();
    usdc.on("Approval", (owner, spender, value) => {
      setApprovedAmount(parseInt(formatFixed(value, 6)));
      setIsTxPending(false);
      usdc.removeAllListeners();
    }).approve(privateSale.address, parseFixed((purchaseAmount).toString(), 6)).then(() => {
      setIsTxPending(true);
    });
  }

  const purchasePop = () => {
    const privateSale = getPrivateSaleContract();
    privateSale.on("TokensPurchased", (participant, amount) => {
      setIsTxPending(false);
      //handle purchase completion
      privateSale.removeAllListeners();
    }).purchase(parseFixed(purchaseAmount.toString(), 6)).then(() => {
      setIsTxPending(true);
    });
  }

  const getPrivateSaleContract = () => {
    return new Contract(PRIVATE_SALE_ADDRESS, PrivateSaleABI, web3React.library.getSigner());
  };

  const getUsdcContract = () => {
    return new Contract(USDC_ADDRESS, ERC20ABI, web3React.library.getSigner());
  };

  useEffect(() => connectWallet(), []); // connect on component mount

  useEffect(() => {
    setIsActive(web3React.active);
    setAccount(web3React.account);
  }, [web3React.active]);

  useEffect(() => {
    if (web3React.error instanceof NoEthereumProviderError) {
      setHasProvider(false);
    } else if (!web3React.error) {
      setHasProvider(true);
    }
  }, [web3React.error]);

  useEffect(() => {
    setAccount(web3React.account);
    if (web3React.account) {
      const usdc = getUsdcContract();
      const privateSale = getPrivateSaleContract();
      privateSale.participants(web3React.account).then(setIsParticipant);
      usdc.balanceOf(web3React.account)
        .then((balance) => setUsdcBalance(parseInt(formatFixed(balance, 6))));
      usdc.allowance(web3React.account, privateSale.address)
        .then((approved) => setApprovedAmount(parseInt(formatFixed(approved, 6))));
    }
  }, [web3React.account]);

  const InstallMetamask = <p>Please install Metamask.</p>;
  const ConnectWallet = <Button onClick={connectWallet}>Connect Wallet</Button>;
  const USDBalance = <p>USDC Balance: ${formatter.format(usdcBalance)}</p>;
  const ApprovedAmount = <p>Approved USDC Balance: ${formatter.format(approvedAmount)}</p>;
  const ApprovePurchase =
    <>
      {USDBalance}
      {ApprovedAmount}
      {isTxPending
        ? <p>Tx In Progress</p>
        : <>$<TextField
          type="number"
          value={purchaseAmount}
          InputProps={{ inputProps: { min: "25000", max: usdcBalance } }}
          onChange={(e) => setPurchaseAmount(parseInt(e.target.value))}
        />
          {purchaseAmount > approvedAmount
            ? <Button onClick={approvePurchase}>Approve Purchase</Button>
            : <Button onClick={purchasePop}>Purchase POP</Button>
          }</>
      }
    </>;
  const Main =
    <>
      <p>Account: {account}</p>
      {isParticipant ? ApprovePurchase : <p>POP purchase not approved for this account</p>}
    </>;

  return (
    <React.Fragment>
      <main className={classes.root}>
        <div className={classes.heroContent}>
          <Container maxWidth="sm">
            <Grid container spacing={6} alignItems="center" style={{ textAlign: "center" }}>
              <Grid item xs={12} sm={12} md={4}>
                <img src="/images/popcorn_v1_dark_bg.png" className={classes.logomark}></img>
              </Grid>
              <Grid item xs={12} sm={12} md={8}>
                <Typography component="h2" variant="h2" align="center" color="textSecondary" gutterBottom>
                  DeFi <Box fontWeight={100} fontStyle="italic" fontSize=".8em"> for the People</Box>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={12} md={12}>
                {hasProvider ? (isActive ? Main : ConnectWallet) : InstallMetamask}
              </Grid>
            </Grid>
          </Container>

        </div>
      </main>
      {/* Footer */}
      <footer className={classes.footer}>
        <img src="/images/popcorn_v1_dark_bg.png" className={classes.logomarkSmall}></img>
      </footer>
      {/* End footer */}
    </React.Fragment>
  );
}
export default Purchase;
