/**
 * @module root/DomainConfigError
 * @summary This module contains the component to be rendered when `domainConfiguration` query fails
 */
import React from 'react'
import { Grid, Typography, withStyles } from '@material-ui/core'

/**
 * Styles to be applied to `DomainFetchError` component
 * @param {object} theme Material UI theme object
 * @returns A Material UI styles object
 */
const errorPageStyle = theme => ({
  containerGrid: {
    background: 'rgba(229, 255, 252, 0.4)',
    width: '100%',
    height: '100vh'
  },
  errorTitleBottomMargin: {
    marginBottom: theme.spacing(5)
  }
})

/**
 * @summary Component to display error if domainConfiguration query gives error
 * @param {object} props React component props
 */
const DomainFetchError = ({ classes }) => (
  <Grid
    container
    justify="center"
    alignItems="center"
    className={classes.containerGrid}
  >
    <Grid item xs={12}>
      <Grid container justify="center">
        <Grid item xs={12} className={classes.errorTitleBottomMargin}>
          <Typography align="center" gutterBottom variant="h4">
            Oops, Something went wrong!
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8} md={6} lg={4} xl={3}>
          <Typography align="center" gutterBottom variant="h6">
            Please try again later
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
)

export default withStyles(errorPageStyle)(DomainFetchError)
