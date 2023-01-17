import React, { Component } from 'react'
import AccountCircle from '@material-ui/icons/AccountCircle'
import {
  Grid,
  Card,
  InputAdornment,
  TextField,
  withStyles
} from '@material-ui/core'

const style = theme => ({
  pageTitle: {
    padding: theme.spacing(3)
  },
  pageContainer: {
    minHeight: `calc(100vh - 64px)`
  }
})

class ManageAccountDetails extends Component {
  render() {
    const { classes } = this.props
    return (
      <Grid container justify="center" className={classes.pageContainer}>
        <Grid item xs={12}>
          <Card>
            <Grid
              container
              justify="center"
              alignItems="center"
              className={classes.pageTitle}
            >
              <TextField
                className={classes.margin}
                id="input-with-icon-textfield"
                label="TextField"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Card>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(style)(ManageAccountDetails)
