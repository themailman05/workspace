import { Button, Card, CardActions, CardContent, Container, Grid, Typography } from "@material-ui/core";
import { FrostedGlass } from "@popcorn/ui";
import React from "react";

export const Products = ({classes}) => {
  return (<Container className={classes.cardGrid} maxWidth="md">
    {/* End hero unit */}

    <Grid container spacing={4}>
      <Grid item xs={12} sm={6} md={4}>
        <Card className={classes.card}>

          <FrostedGlass width="100%" height="100%">
            <CardContent className={classes.cardContent}>
              <Typography gutterBottom variant="h5" component="h2">
                Stake POP
            </Typography>
              <Typography>
                -% APY
            </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="secondary">
                View
            </Button>
            </CardActions>
          </FrostedGlass>
        </Card>

      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card className={classes.card}>

          <FrostedGlass width="100%" height="100%">
            <CardContent className={classes.cardContent}>
              <Typography gutterBottom variant="h5" component="h2">
                POP/ETH Uniswap LP
            </Typography>
              <Typography>
                -% APY
            </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="secondary">
                View
            </Button>
            </CardActions>
          </FrostedGlass>
        </Card>

      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card className={classes.card}>

          <FrostedGlass width="100%" height="100%">
            <CardContent className={classes.cardContent}>
              <Typography gutterBottom variant="h5" component="h2">
                SHAKE
            </Typography>
              <Typography>
                -% (7d)
            </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="secondary">
                View
            </Button>
            </CardActions>
          </FrostedGlass>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card className={classes.card}>

          <FrostedGlass width="100%" height="100%">
            <CardContent className={classes.cardContent}>
              <Typography gutterBottom variant="h5" component="h2">
                SHAKE/ETH Uniswap LP
            </Typography>
              <Typography>
                -% APY
            </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="secondary">
                View
            </Button>
            </CardActions>
          </FrostedGlass>
        </Card>

      </Grid>
    </Grid>
  </Container>);
}