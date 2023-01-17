/**
 * @module AccountMenu
 * @summary This module exports the main account menu component
 */
import React from 'react'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import { withRouter } from 'react-router-dom'
import {
  Typography,
  withStyles,
  Grid,
  Divider,
  Popover,
  Card,
  CardContent,
  Button,
} from '@material-ui/core'
import { AuthConsumer } from '@zeliot/common/auth'
import { getItem } from 'storage.js'

const styles = {
  accountMenuPopover: {
    zIndex: 2200,
  },
  accountCard: {
    width: '300px',
    borderRadius: '5px',
  },
  cardContent: {
    padding: '10px !important',
  },
  LogoutButton: {
    borderColor: 'rgb(230, 50, 50)',
  },
}

/**
 * @summary AccountMenu component opens the Account menu on clicking account icon button
 * @param {object} props React component props
 */
function AccountMenu(props) {
  const {
    classes,
    isAccountMenuOpen,
    anchorEl,
    onClose,
    logout,
    popoverOptions,
  } = props

  return (
    <Popover
      className={classes.accountMenuPopover}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isAccountMenuOpen}
      anchorEl={anchorEl}
      onClose={onClose}
    >
      <Card className={classes.accountCard}>
        <CardContent className={classes.cardContent}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="body1">
                {popoverOptions.accountMenuLabel}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption">
                {popoverOptions.userNameLabel}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography>
                {getItem('username', 'PERSISTENT') ||
                  getItem('username', 'TEMPORARY')}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Grid container justify="flex-end">
                <Button
                  className={classes.LogoutButton}
                  variant="outlined"
                  onClick={logout}
                >
                  {popoverOptions.logoutButtonTitle}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Popover>
  )
}

AccountMenu.propTypes = {
  isAccountMenuOpen: PropTypes.bool.isRequired,
}

export default withRouter(
  withApollo(
    withStyles(styles)((props) => (
      <AuthConsumer>
        {({ logout }) => <AccountMenu {...props} logout={logout} />}
      </AuthConsumer>
    ))
  )
)
