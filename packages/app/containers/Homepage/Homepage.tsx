import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Box, Link } from '@material-ui/core';

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
    background: "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%)",
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255,255,255,.4)',
    backgroundFilter: "blur(3px)",
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    backgroundColor: 'rgba(255,255,255,.0)',
    flexGrow: 1,
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


export const Homepage = () => {
  const classes = useStyles();

  return (
    <React.Fragment>

      <main className={classes.root}>
        {/* Hero unit */}
        <div className={classes.heroContent}>

          <Container maxWidth="sm">
            <Grid container spacing={4}>
      
              <Grid item xs={4} sm={4} md={4}>
              <img src="/images/popcorn_v1_dark_bg.png" className={classes.logomark}></img>
       

              </Grid>
              <Grid item xs={8} sm={8} md={8}>
              <Typography component="h1" variant="h2" align="center" color="textSecondary" gutterBottom>
                  <br />
                  DeFi <Box fontWeight={100} fontStyle="italic" fontSize=".8em"> for the People</Box>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={12} md={12}>
                <Typography variant="h5" align="center" color="textSecondary" paragraph className={classes.p}>
                  Popcorn is a new paradigm for DeFi where yield-generating products simultaneously contribute to social impact.
            </Typography>
              </Grid>
            </Grid>
            <div className={classes.heroButtons}>
              <Grid container spacing={2} justify="center">
                <Grid item>
                  <Link href="/docs/Popcorn_whitepaper_v1.pdf" target="_window">
                    <Button variant="contained" color="primary" className={classes.button}>
                      Download Whitepaper
                    </Button>
                  </Link>
                </Grid>

              </Grid>
            </div>
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
export default Homepage;
