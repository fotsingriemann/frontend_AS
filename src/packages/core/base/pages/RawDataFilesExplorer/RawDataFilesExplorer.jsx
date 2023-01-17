import React, { Component } from 'react'
import { Typography, withStyles, Grid, Divider } from '@material-ui/core'
import DataFileExplorer from '@zeliot/core/base/modules/DataFileExplorer'

const styles = theme => ({
  root: {
    padding: theme.spacing(3)
  },
  textLeft: {
    textAlign: 'left'
  }
})

class RawDataFilesExplorer extends Component {
  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item>
                <Typography
                  variant="h5"
                  className={classes.textLeft}
                  gutterBottom
                >
                  File Explorer
                </Typography>
              </Grid>
            </Grid>
            <br />
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <DataFileExplorer />
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(RawDataFilesExplorer)
