import React, { Component } from 'react'
import { Link, Switch } from 'react-router-dom'
import { PrivateRoute } from '@zeliot/common/router'
import AoiModule from '@zeliot/core/base/modules/AoiModule'
import SchoolAoiDashboard from '@zeliot/school/base/modules/SchoolAoiDashboard'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'

import {
  withStyles,
  Grid,
  Typography,
  Divider,
  Button,
} from '@material-ui/core'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const SYNC_STOPS_DATA = gql`
  mutation($scriptType: ScriptType!, $clientLoginId: Int!) {
    syncThirdPartyAPIData(
      scriptType: $scriptType
      clientLoginId: $clientLoginId
    ) {
      message
    }
  }
`

const style = (theme) => ({
  root: {
    padding: theme.spacing(3),
  },
})

class SchoolAoi extends Component {
  state = {
    scriptType: 'SYNC_AOI',
    clientLoginId: null,
    isSyncSupported: false,
  }

  componentDidMount = () => {
    this.getLocalData()
  }

  getLocalData = () => {
    const plan = localStorage.getItem('plan')
    const accountType = localStorage.getItem('accountType')
    const isERP = localStorage.getItem('isERP')
    const clientLoginId = parseInt(localStorage.getItem('loginId'), 10)
    if (accountType === 'CLT' && plan === 'School Plan' && isERP === 'true') {
      this.setState({
        isSyncSupported: true,
        clientLoginId,
      })
    }
  }

  syncStopData = async () => {
    this.props.setDialogTitle('Stops data sync inprogress')
    this.props.openDialog()

    const response = await this.props.client.mutate({
      mutation: SYNC_STOPS_DATA,
      variables: {
        scriptType: this.state.scriptType,
        clientLoginId: this.state.clientLoginId,
      },
    })
    if (response.data) {
      const {
        syncThirdPartyAPIData: { message },
      } = response.data
      // this.setState({ alertMessage: message })
      this.props.openSnackbar(`Stops data ${message} `)
      this.props.closeDialog()
      console.log('response data', message)
    } else {
      console.log('no response')
    }
  }

  handleClick = () => {
    this.syncStopData()
  }

  render() {
    const { classes } = this.props
    const { isSyncSupported } = this.state

    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container justify="space-between" alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <Typography
                  variant="h5"
                  className={classes.textLeft}
                  gutterBottom
                >
                  Stops Dashboard
                </Typography>
              </Grid>
              <Grid item xs container justify="flex-end" spacing={3}>
                {isSyncSupported ? (
                  <Grid item>
                    <ColorButton
                      variant="contained"
                      color="primary"
                      onClick={this.handleClick}
                      disabled={this.props.isOpen}
                    >
                      Sync Stops
                    </ColorButton>
                  </Grid>
                ) : null}
                <Grid item>
                  <ColorButton
                    component={Link}
                    variant="contained"
                    color="primary"
                    to="/home/AOI/create"
                  >
                    CREATE Stop(s)
                  </ColorButton>
                </Grid>
              </Grid>
            </Grid>
            <br />
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <SchoolAoiDashboard />
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

const WrappedSchoolAoi = withStyles(style)(SchoolAoi)

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/AOI"
      // render={props => <WrappedSchoolAoi {...props} />}
      component={withSharedSnackbar(
        withApollo(
          withStyles(style)((props) => (
            <DownloadProgressDialogConsumer>
              {({ openDialog, closeDialog, isOpen, setDialogTitle }) => (
                <SchoolAoi
                  openDialog={openDialog}
                  closeDialog={closeDialog}
                  isOpen={isOpen}
                  setDialogTitle={setDialogTitle}
                  {...props}
                />
              )}
            </DownloadProgressDialogConsumer>
          ))
        )
      )}
    />
    <PrivateRoute
      exact
      path="/home/AOI/create"
      render={(props) => <AoiModule {...props} />}
    />
  </Switch>
)
