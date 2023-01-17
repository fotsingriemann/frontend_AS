/**
 * @module Users/ViewDialogBox
 * @summary This module exports the component for viewing user details
 */
import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import {
  Button,
  withStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Divider
} from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'

const GET_USER = gql`
  query userDetail($id: Int!, $clientLoginId: Int!) {
    user: userDetail(clientLoginId: $clientLoginId, id: $id) {
      userName
      email
      contactNumber
      login {
        username
      }
      role {
        roleName
      }
      group {
        groupName
      }
    }
  }
`

const styles = theme => ({
  root: {
    padding: theme.spacing(2),
    flexGrow: 1
  }
})

/**
 * @param {object} props React component props
 * @summary ViewDialogBox component renders a Dialog for showing user's details
 */
function ViewDialogBox(props) {
  const { classes, id, openViewDialog, handleClose } = props

  return (
    <Query
      query={GET_USER}
      variables={{
        id,
        clientLoginId: getLoginId()
      }}
    >
      {({ loading, error, data }) => {
        if (loading) return null
        if (error) return `Error!: ${error}`

        const { user } = data

        return (
          <Dialog
            className={classes.root}
            open={openViewDialog}
            onClose={handleClose('openViewDialog')}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">User Details</DialogTitle>

            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1">Name:</Typography>
                  <Typography variant="body2">{user.userName}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1">Email:</Typography>
                  <Typography variant="body2">{user.email}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1">Contact Number:</Typography>
                  <Typography variant="body2">{user.contactNumber}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1">User Name:</Typography>
                  <Typography variant="body2">{user.login.username}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1">Role:</Typography>
                  <Typography variant="body2">{user.role.roleName}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1">Assigned Group:</Typography>
                  <Typography variant="body2">
                    {user.group.groupName}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose('openViewDialog')} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )
      }}
    </Query>
  )
}

ViewDialogBox.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ViewDialogBox)
