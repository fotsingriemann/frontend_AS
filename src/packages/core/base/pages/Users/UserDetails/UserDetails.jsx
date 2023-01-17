/**
 * @module Users/UserDetails
 * @summary This module exports the UserDetails page
 */

import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Input,
  InputAdornment,
  withStyles,
  Typography,
  Grid,
  Avatar,
  Button,
  IconButton,
} from '@material-ui/core'
import { Person, Search, Edit, Delete, VideoLabel } from '@material-ui/icons'
import getLoginId from '@zeliot/common/utils/getLoginId'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const GET_USERS = gql`
  query allUserDetails($clientLoginId: Int) {
    users: allUserDetails(clientLoginId: $clientLoginId) {
      id
      userName
      email
      role {
        roleName
      }
      login {
        loginId
        username
      }
    }
  }
`

const styles = (theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  table: {
    minWidth: 700,
  },
  bigAvatar: {
    width: 60,
    height: 60,
  },
  button: {
    margin: theme.spacing(1),
  },
  listItem: {
    width: '100%',
    textAlign: 'left',
  },
  searchBar: {
    margin: theme.spacing(2),
  },
})

/**
 * @summary UserDetails page shows the list of users
 */
class UserDetails extends React.Component {
  /**
   * @property {string} searchText The text for searching users
   */
  state = {
    searchText: '',
  }

  /**
   * @callback
   * @summary Search text change event handler
   */
  handleSearchChange = (e) => {
    const searchText = e.target.value
    this.setState({ searchText })
  }

  render() {
    const { classes, users, selectedLanguage } = this.props
    const { searchText } = this.state

    const searchTextLowerCase = searchText.toLowerCase()

    /* eslint-disable indent */
    const filteredUsers =
      searchText === ''
        ? users
        : users.filter(
            (user) =>
              user.userName.toLowerCase().includes(searchTextLowerCase) ||
              user.login.username.toLowerCase().includes(searchTextLowerCase)
          )
    /* eslint-enable indent */

    return (
      <div className={classes.root}>
        <div className={classes.searchBar}>
          <Input
            value={this.state.searchText}
            onChange={this.handleSearchChange}
            placeholder={
              languageJson[selectedLanguage].usersPage.users.searchUser
            }
            startAdornment={
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            }
          />
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {
                  languageJson[selectedLanguage].usersPage.users
                    .userTableColumn[0]
                }
              </TableCell>
              <TableCell>
                {
                  languageJson[selectedLanguage].usersPage.users
                    .userTableColumn[1]
                }
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                onClick={() => this.props.handleView(user.id)}
              >
                <TableCell>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar className={classes.bigAvatar}>
                        <Person />
                      </Avatar>
                    </Grid>

                    <Grid item>
                      <Grid container spacing={1} direction="column">
                        <Grid item>
                          <Typography variant="body2" color="textSecondary">
                            {user.login.username}
                          </Typography>
                        </Grid>

                        <Grid item>
                          <Typography variant="body2">
                            {user.userName}
                          </Typography>
                        </Grid>

                        <Grid item>
                          <Typography variant="body2">{user.email}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{user.role.roleName}</Typography>
                </TableCell>

                <TableCell>
                  <IconButton
                    variant="text"
                    color="primary"
                    className={classes.button}
                    onClick={this.props.handleEdit(user.id)}
                  >
                    <Edit />
                  </IconButton>
                </TableCell>

                <TableCell>
                  <IconButton
                    variant="text"
                    color="primary"
                    className={classes.button}
                    onClick={this.props.handleDelete(user.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>

                <TableCell>
                  <Button
                    variant="text"
                    color="primary"
                    className={classes.button}
                    onClick={this.props.handlePasswordReset(user.login.loginId)}
                  >
                    Password Reset
                  </Button>
                </TableCell>

                {/* <TableCell>
                  <IconButton
                    variant="text"
                    color="primary"
                    className={classes.button}
                    onClick={() => this.props.handleLoginPreview(user)}
                  >
                    <VideoLabel />
                  </IconButton>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
}

UserDetails.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withLanguage(
  withStyles(styles)((props) => (
    <Query
      query={GET_USERS}
      variables={{
        clientLoginId: getLoginId(),
      }}
      fetchPolicy="cache-and-network"
    >
      {({ loading, data }) => {
        if (loading) return null

        return <UserDetails {...props} users={data.users} />
      }}
    </Query>
  ))
)
