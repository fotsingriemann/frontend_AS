/**
 * @module Users
 * @summary This module exports the Users page
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Link, Switch } from 'react-router-dom'
import {
  withStyles,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Typography,
  Dialog,
} from '@material-ui/core'
import { PrivateRoute } from '@zeliot/common/router'
import { withApollo } from 'react-apollo'
import UserDetails from './UserDetails'
import ViewDialogBox from './ViewDialogBox'
import EditDialogBox from './EditDialogBox'
import NewDialogBox from './NewDialogBox'
import RoleDetails from './RoleDetails'
import ViewRoleDialogBox from './ViewRoleDialogBox'
import EditRole from './EditRole'
import NewRole from './NewRole/NewRole'
import DeleteDialogBox from './DeleteDialogBox'
import PasswordResetDialogBox from './PasswordResetDialogBox'
import gql from 'graphql-tag'
import getLoginId from '@zeliot/common/utils/getLoginId'
import UserBulkUpload from './UserBulkUpload'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const GET_LOGIN_TOKEN = gql`
  query($loginId: Int!) {
    getLoginTokenAPI(loginId: $loginId) {
      token
    }
  }
`

const PARTNER_DETAIL = gql`
  query($loginId: Int) {
    partnerDetail(loginId: $loginId) {
      domain
    }
  }
`

const styles = (theme) => ({
  root: {
    padding: theme.spacing(2),
    flexGrow: 1,
  },
})

/**
 * @summary Users page shows the list of user/roles and wraps other sub pages of users
 */
class Users extends React.Component {
  /**
   * @property {number} value The tab value
   * @property {boolean} openViewDialog Boolean to decide whether to open the view dialog
   * @property {string} dialogUsername The username to show in the dialog
   * @property {boolean} openEditDialog Boolean to open a dialog for editing
   * @property {boolean} openNewDialog Boolean to open a dialog for creating a new user
   * @property {boolean} openRoleViewDialog Boolean to open dialog to view a role
   * @property {string} roleName The name of the role
   * @property {number?} dialogUserId The user's ID
   * @property {boolean} openDeleteDialog Whether to open a dialog to delete a user
   * @property {boolean} openPasswordDialog Whether to open a dialog to delete a user
   * @property {number?} dialogUserLoginId User's login ID
   */
  state = {
    value: 0,
    openViewDialog: false,
    dialogUsername: '',
    openEditDialog: false,
    openNewDialog: false,
    openRoleViewDialog: false,
    roleName: '',
    dialogUserId: null,
    openDeleteDialog: false,
    openPasswordDialog: false,
    dialogUserLoginId: null,
    domain: '',
  }

  componentDidMount = async () => {
    let response = await this.props.client.query({
      query: PARTNER_DETAIL,
      variables: {
        loginId: getLoginId(),
      },
    })
    if (response.data && response.data.partnerDetail) {
      this.setState({ domain: response.data.partnerDetail.domain })
    }
  }

  /**
   * @callback
   * @summary Change event handler with value
   */
  handleChange = (event, value) => this.setState({ value })

  /**
   * @callback
   * @summary Opens the dialog to view a user
   */
  handleView = (id) => (e) =>
    this.setState({
      openViewDialog: true,
      dialogUserId: id,
      openEditDialog: false,
      openNewDialog: false,
      openDeleteDialog: false,
      openPasswordDialog: false,
    })

  /**
   * @callback
   * @summary Opens the dialog to edit a user
   */
  handleEdit = (id) => (e) => {
    e.stopPropagation()
    this.setState({
      openViewDialog: false,
      dialogUserId: id,
      openEditDialog: true,
      openNewDialog: false,
      openDeleteDialog: false,
      openPasswordDialog: false,
    })
  }

  /**
   * @callback
   * @summary Opens the dialog for deleting a user
   */
  handleDelete = (id) => (e) => {
    e.stopPropagation()
    this.setState({
      openViewDialog: false,
      dialogUserId: id,
      openDeleteDialog: true,
      openEditDialog: false,
      openNewDialog: false,
      openPasswordDialog: false,
    })
  }

  /**
   * @callback
   * @summary Opens the dialog for reseting the password
   */
  handlePasswordReset = (id) => (e) => {
    e.stopPropagation()
    this.setState({
      openViewDialog: false,
      dialogUserLoginId: id,
      openPasswordDialog: true,
      openEditDialog: false,
      openNewDialog: false,
      openDeleteDialog: false,
    })
  }

  /**
   * @callback
   * @summary Opens a dialog to delete a user
   */
  handleDelete = (id) => (e) => {
    e.stopPropagation()
    this.setState({
      openViewDialog: false,
      dialogUserId: id,
      openDeleteDialog: true,
      openEditDialog: false,
      openNewDialog: false,
      openPasswordDialog: false,
    })
  }

  /**
   * @callback
   * @summary Opens a dialog to reset password
   */
  handlePasswordReset = (id) => (e) => {
    e.stopPropagation()
    this.setState({
      openViewDialog: false,
      dialogUserLoginId: id,
      openPasswordDialog: true,
      openEditDialog: false,
      openNewDialog: false,
      openDeleteDialog: false,
    })
  }

  /**
   * @callback
   * @summary Opens a dialog to create a new user
   */
  handleNewUser = (e) => {
    e.stopPropagation()
    this.setState({
      openViewDialog: false,
      dialogUsername: '',
      openEditDialog: false,
      openDeleteDialog: false,
      openNewDialog: true,
      openPasswordDialog: false,
    })
  }

  /**
   * @callback
   * @summary Closes the given dialog
   */
  handleClose = (name) => (e) => {
    this.setState({
      [name]: false,
      dialogUsername: '',
      roleName: '',
    })
  }

  /**
   * @callback
   * @summary Opens the dialog for viewing a role
   */
  handleRoleView = (rolename) => (e) => {
    this.setState({
      roleName: rolename,
      openRoleViewDialog: true,
    })
  }

  /**
   * @callback
   * @summary Navigates to user edit page
   */
  handleRoleEdit = (rolename) => (e) => {
    e.stopPropagation()
    this.props.history.push({
      pathname: '/home/manage-users/edit/' + rolename,
    })
  }

  /**
   * @callback
   * @summary Navigates to user creating page
   */
  handleNewRole = (e) => {
    this.props.history.push({
      pathname: '/home/manage-users/new',
    })
  }

  handleLoginPreview = async (userLogin) => {
    let response = await this.props.client.query({
      query: GET_LOGIN_TOKEN,
      variables: {
        loginId: userLogin.login.loginId,
      },
    })
    if (response.data && response.data.getLoginTokenAPI) {
      // console.log('token', response.data.getLoginTokenAPI)
      this.setState(
        {
          previewToken: response.data.getLoginTokenAPI.token,
        },
        () =>
          // browser.windows.create({
          //   url:
          //     `https://school.aquilatrack.com/?token=` +
          //     this.state.previewToken,
          //   incognito: true
          // })
          window.open(
            // `${this.state.domain}` + this.state.previewToken,
            `https://pappayashadow.com/?token=` + this.state.previewToken,
            'Login Preview',
            'height=720,width=1280'
          )
      )
    }
  }

  render() {
    const { classes, selectedLanguage } = this.props
    const { value } = this.state

    return (
      <div className={classes.root}>
        <Grid
          container
          spacing={2}
          direction="row-reverse"
          justify="space-between"
          alignItems="flex-end"
        >
          <Grid item>
            {!value ? (
              <Grid>
                <Button
                  className={classes.button}
                  color="primary"
                  variant="contained"
                  onClick={this.handleNewUser}
                >
                  {
                    languageJson[selectedLanguage].usersPage.users
                      .newUserButtonTitle
                  }
                </Button>
                <Button
                  component={Link}
                  className={classes.button}
                  color="primary"
                  variant="contained"
                  style={{ marginLeft: 10 }}
                  to="/home/manage-users/userBulk"
                >
                  {
                    languageJson[selectedLanguage].usersPage.users
                      .userBulkUploadButtonTitle
                  }
                </Button>
              </Grid>
            ) : (
              <Button
                className={classes.button}
                color="primary"
                variant="contained"
                onClick={this.handleNewRole}
              >
                {
                  languageJson[selectedLanguage].usersPage.roles
                    .newRoleButtonTitle
                }
              </Button>
            )}
          </Grid>

          <Grid item>
            <Typography variant="h5">
              {languageJson[selectedLanguage].usersPage.pageTitle}
            </Typography>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item>
            <Paper>
              <Tabs
                value={value}
                onChange={this.handleChange}
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab
                  label={
                    languageJson[selectedLanguage].usersPage.users.userTabTitle
                  }
                />
                <Tab
                  label={
                    languageJson[selectedLanguage].usersPage.roles.rolesTabTitle
                  }
                />
              </Tabs>
            </Paper>
          </Grid>

          <Grid item container xs={12}>
            {!value ? (
              <UserDetails
                handleView={this.handleView}
                handleEdit={this.handleEdit}
                handleDelete={this.handleDelete}
                handlePasswordReset={this.handlePasswordReset}
                handleLoginPreview={this.handleLoginPreview}
                plan={this.state.plan}
              />
            ) : (
              <RoleDetails
                handleView={this.handleRoleView}
                handleEdit={this.handleRoleEdit}
              />
            )}

            {this.state.openViewDialog && (
              <ViewDialogBox
                openViewDialog={this.state.openViewDialog}
                id={this.state.dialogUserId}
                handleClose={this.handleClose}
              />
            )}

            {this.state.openEditDialog && (
              <EditDialogBox
                openEditDialog={this.state.openEditDialog}
                id={this.state.dialogUserId}
                handleClose={this.handleClose}
              />
            )}

            {this.state.openNewDialog && (
              <NewDialogBox
                openNewDialog={this.state.openNewDialog}
                username={this.state.dialogUsername}
                handleClose={this.handleClose}
              />
            )}

            {this.state.openRoleViewDialog && (
              <ViewRoleDialogBox
                openRoleViewDialog={this.state.openRoleViewDialog}
                roleName={this.state.roleName}
                handleClose={this.handleClose}
              />
            )}

            {this.state.openDeleteDialog && (
              <Dialog
                className={classes.root}
                open={this.state.openDeleteDialog}
                onClose={this.handleClose('openDeleteDialog')}
                aria-labelledby="form-dialog-title"
              >
                <DeleteDialogBox
                  openDeleteDialog={this.state.openDeleteDialog}
                  userId={this.state.dialogUserId}
                  handleClose={this.handleClose('openDeleteDialog')}
                />
              </Dialog>
            )}

            {this.state.openPasswordDialog && (
              <PasswordResetDialogBox
                openPasswordDialog={this.state.openPasswordDialog}
                userId={this.state.dialogUserLoginId}
                handleClose={this.handleClose}
              />
            )}
          </Grid>
        </Grid>
      </div>
    )
  }
}

Users.propTypes = {
  classes: PropTypes.object.isRequired,
}

const WrappedUsers = withLanguage(withStyles(styles)(Users))

export default () => (
  <Switch>
    <PrivateRoute
      exact
      path="/home/manage-users/"
      render={(props) => <WrappedUsers {...props} />}
      component={withApollo(withLanguage(withStyles(styles)(Users)))}
    />
    <PrivateRoute
      exact
      path="/home/manage-users/userBulk"
      render={(props) => <UserBulkUpload {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/manage-users/edit/:roleName"
      render={(props) => <EditRole {...props} />}
    />
    <PrivateRoute
      exact
      path="/home/manage-users/new"
      render={(props) => <NewRole {...props} />}
    />
  </Switch>
)
