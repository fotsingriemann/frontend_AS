/**
 * @module AlertsDashboard/AlertCard
 * @summary AlertCard module exports the AlertCard component
 */

import React from 'react'
import PropTypes from 'prop-types'
import DefaultIcon from '@material-ui/icons/Warning'
import { THEME_MAIN_COLORS as COLOR_RANGE } from '@zeliot/common/constants/styles'
import {
  withStyles,
  Grid,
  Typography,
  Paper,
  Tooltip,
  Zoom,
  Badge
} from '@material-ui/core'

const style = theme => ({
  margin: {
    margin: theme.spacing(1)
  },
  title: {
    color: 'inherit'
  },
  textCenter: {
    textAlign: 'center'
  },
  textLeft: {
    textAlign: 'left'
  },
  textRight: {
    textAlign: 'right'
  },
  fullHeight: {
    height: '100%'
  },
  fullWidth: {
    width: '100%'
  }
})

/**
 * @param {object} props React component props
 * @summary AlertCard component renders a Card for rendering alert type with logo & title
 * and badge for showing count of alerts
 */
function AlertCard(props) {
  const {
    classes,
    AlertIcon,
    filter,
    alertCount,
    alertDescription,
    clicked,
    cardColor,
    alertName
  } = props

  return (
    <Badge
      color="primary"
      badgeContent={alertCount}
      invisible={alertCount <= 0}
      className={classes.fullHeight + ' ' + classes.fullWidth}
    >
      <Tooltip
        TransitionComponent={Zoom}
        title={alertDescription}
        style={{ cursor: 'pointer' }}
      >
        <Paper
          square
          elevation={clicked ? 1 : 6}
          onClick={filter}
          className={classes.fullWidth}
        >
          <Grid container spacing={0}>
            <Grid
              item
              xs={12}
              style={{
                backgroundColor: cardColor,
                textAlign: 'center',
                padding: 8
              }}
            >
              <AlertIcon
                style={{
                  color: 'white',
                  fontSize: 36
                }}
              />
            </Grid>
            <Grid item xs={12} style={{ padding: 4 }}>
              <Typography
                variant="body2"
                style={{ fontSize: 12 }}
                align="center"
                color={clicked ? 'textPrimary' : 'textSecondary'}
              >
                {alertName}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Tooltip>
    </Badge>
  )
}

AlertCard.propTypes = {
  alertName: PropTypes.string,
  AlertIcon: PropTypes.any,
  alertDescription: PropTypes.string,
  alertCount: PropTypes.number,
  cardColor: PropTypes.string,
  filter: PropTypes.func,
  alertType: PropTypes.string,
  clicked: PropTypes.bool
}

AlertCard.defaultProps = {
  alertName: 'Default',
  AlertIcon: DefaultIcon,
  alertDescription: 'This is default alert description',
  alertCount: 0,
  cardColor: COLOR_RANGE.green
}

export default withStyles(style)(AlertCard)
