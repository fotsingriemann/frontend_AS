import React, { Component } from 'react'
import PropTypes from 'prop-types'
import withRouter from 'react-router-dom/withRouter'
import Typography from '@material-ui/core/Typography'
import withStyles from '@material-ui/core/styles/withStyles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Popover from '@material-ui/core/Popover'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import { AuthConsumer } from '@zeliot/common/auth'
import { getItem } from '../../../../../storage.js'

const styles = theme => ({
  accountMenuPopover: {
    zIndex: 2200
  },
  accountCard: {
    width: '300px',
    borderRadius: '5px'
  },
  cardContent: {
    padding: '10px !important'
  },
  LogoutButton: {
    borderColor: 'rgb(230, 50, 50)'
  }
})

class AccountMenu extends Component {
  static propTypes = {
    isAccountMenuOpen: PropTypes.bool.isRequired
  }

  render() {
    const { classes, isAccountMenuOpen } = this.props

    return (
      <Popover
        className={classes.accountMenuPopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={isAccountMenuOpen}
        anchorEl={this.props.anchorEl}
        onClose={this.props.onClose}
      >
        <Card className={classes.accountCard}>
          <CardContent className={classes.cardContent}>
            <Grid container spacing={8}>
              <Grid item xs={12}>
                <Typography variant="body1">Account</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption">Username</Typography>
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
                    onClick={this.props.logout}
                  >
                    Logout
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Popover>
    )
  }
}

export default withRouter(
  withStyles(styles)(props => (
    <AuthConsumer>
      {({ logout }) => <AccountMenu {...props} logout={logout} />}
    </AuthConsumer>
  ))
)
