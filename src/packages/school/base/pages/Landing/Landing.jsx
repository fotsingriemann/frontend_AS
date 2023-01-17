import React from 'react'
import './Landing.css'
import LoginForm from '@zeliot/core/base/modules/LoginForm'

import { Typography, Grid } from '@material-ui/core'

const style = {
  whiteText: {
    color: '#ffffff'
  },
  blackText: {
    color: '#000000'
  }
}

const Landing = () => (
  <div
    className="Landing"
    style={{
      backgroundImage: `url(https://source.unsplash.com/random/1920x1080)`,
      backgroundSize: 'cover'
    }}
  >
    <Grid
      container
      alignItems="center"
      justify="center"
      className="full-screen"
    >
      <Grid item xs={12}>
        <Typography variant="h4" align="center" style={style.blackText}>
          AquilaTrack 5.0
        </Typography>
        <br />
        <Typography variant="h6" align="center">
          Testing Random background page
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={5} lg={4}>
        <LoginForm />
      </Grid>
      <Grid item xs={12} />
    </Grid>
  </div>
)

export default Landing
