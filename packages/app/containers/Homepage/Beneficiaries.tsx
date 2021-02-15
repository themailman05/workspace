import { Button, Card, CardActions, CardContent, CardMedia, Container, Grid, Typography } from "@material-ui/core";
import { FrostedGlass } from "@popcorn/ui/components";
import React from "react";

export const Beneficiaries = ({classes}) => {
  return (<Container className={classes.cardGrid} maxWidth="md">
    <Typography gutterBottom variant="h2" component="h2" >
      Eligible Beneficiaries
  </Typography>
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6} md={4}>
        <Card className={classes.card}>
          <CardMedia
            className={classes.cardMedia}
            image="https://static.wixstatic.com/media/b8af48_fe81957edff24430a481887f5f1f7f46~mv2.jpg/v1/fill/w_234,h_232,al_c,lg_1,q_90/AfricaDevelopmentPromise.webp"
            title="Image title"
          />
          <FrostedGlass width="100%" height="100%">
            <CardContent className={classes.cardContent}>
              <Typography gutterBottom variant="h5" component="h2">
                Pencils of Promise
            </Typography>
              <Typography>
                Schools built: 538<br />
              Current Students: 110,594
            </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="secondary">
                Enrollment Status: Pending
            </Button>
            </CardActions>
          </FrostedGlass>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card className={classes.card}>
          <CardMedia
            className={classes.cardMedia}
            image="/images/gitcoin.png"
            title="Image title"
          />
          <FrostedGlass width="100%" height="100%">
            <CardContent className={classes.cardContent}>
              <Typography gutterBottom variant="h5" component="h2">
                Gitcoin
            </Typography>
              <Typography>
                11.6M funded for Open Source<br />
              Active Developers: 60,974
            </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="secondary">
                Enrollment Status: Pending
            </Button>
            </CardActions>
          </FrostedGlass>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card className={classes.card}>
          <CardMedia
            className={classes.cardMedia}
            image="https://static.wixstatic.com/media/490f99_fbe1cec093fa4dbdbc67f8022938db3c~mv2.jpg/v1/fill/w_234,h_232,al_c,lg_1,q_90/AfricaDevelopmentPromise.webp"
            title="Image title"
          />
          <FrostedGlass width="100%" height="100%">
            <CardContent className={classes.cardContent}>
              <Typography gutterBottom variant="h5" component="h2">
                Trees for the Future
            </Typography>
              <Typography>
                Trees planted: 200,000,000+<br />
              Lives impacted: 151,025
            </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="secondary">
                Enrollment Status: Pending
              </Button>
            </CardActions>
          </FrostedGlass>
        </Card>
      </Grid>
    </Grid>
  </Container>);
}