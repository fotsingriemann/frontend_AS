/**
 * @module WidgetCard
 * @summary This module exports the WidgetCard component
 */

import React from 'react'
import PropTypes from 'prop-types'
import DefaultIcon from '@material-ui/icons/Extension'
import UpTrendIcon from '@material-ui/icons/ArrowUpward'
import DownTrendIcon from '@material-ui/icons/ArrowDownward'

import {
  withStyles,
  Grid,
  Typography,
  Paper,
  Divider,
  Icon
} from '@material-ui/core'

import { red, green } from '@material-ui/core/colors'

const style = theme => ({
  textCenter: {
    textAlign: 'center'
  },
  textRight: {
    textAlign: 'right'
  },
  textLeft: {
    textAlign: 'left'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  upTrendIcon: {
    margin: theme.spacing(1),
    color: green[800]
  },
  downTrendIcon: {
    margin: theme.spacing(1),
    color: red[800]
  }
})

/**
 * The WidgetCard Component renders a Card with icons, title & data for use in Analytics module
 * @param {object} props The props passed to this component
 */
function WidgetCard(props) {
  const {
    classes,
    WidgetIcon,
    widgetTrend,
    trendPeriod,
    cardElevation,
    onCardClick,
    widgetIconColor,
    widgetIconSize,
    widgetTitle,
    widgetValue,
    widgetDescription,
    isDescriptionAvailable
  } = props

  return (
    <Paper
      square
      elevation={cardElevation}
      className={classes.paper}
      onClick={onCardClick}
    >
      <Grid container spacing={1} alignItems="center" justify="space-between">
        <Grid item xs={3} className={classes.textLeft}>
          <WidgetIcon
            style={{
              color: widgetIconColor,
              fontSize: widgetIconSize
            }}
          />
        </Grid>
        <Grid item xs={9} className={classes.textRight}>
          <Typography variant="body1" color="textSecondary">
            {widgetTitle}
          </Typography>
          <Typography variant="h5" gutterBottom>
            {widgetValue}
          </Typography>
          {widgetTrend != null && (
            <Grid container justify="flex-end" alignItems="center">
              <Grid item>
                {widgetTrend >= 0 ? (
                  <Icon className={classes.upTrendIcon} fontSize="large">
                    <UpTrendIcon />
                  </Icon>
                ) : (
                  <Icon className={classes.downTrendIcon} fontSize="large">
                    <DownTrendIcon />
                  </Icon>
                )}
              </Grid>
              <Grid item>
                <Typography variant="caption" color="textSecondary">
                  {trendPeriod
                    ? `${Math.abs(widgetTrend)} % since last ${trendPeriod}`
                    : `${Math.abs(widgetTrend)} % since last time`}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Grid>
        {isDescriptionAvailable ? (
          <div>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} className={classes.textLeft}>
              <Typography variant="caption" color="textSecondary">
                {widgetDescription}
              </Typography>
            </Grid>
          </div>
        ) : (
          ' '
        )}
        {null}
      </Grid>
    </Paper>
  )
}

WidgetCard.propTypes = {
  widgetTitle: PropTypes.string,
  widgetValue: PropTypes.string,
  WidgetIcon: PropTypes.any,
  widgetIconSize: PropTypes.number,
  widgetIconColor: PropTypes.string,
  widgetDescription: PropTypes.string,
  isDescriptionAvailable: PropTypes.bool,
  cardElevation: PropTypes.number
}

WidgetCard.defaultProps = {
  widgetTitle: 'Widget',
  widgetValue: '9999',
  WidgetIcon: DefaultIcon,
  widgetIconSize: 60,
  widgetIconColor: '#0091ea',
  widgetDescription: ' ',
  isDescriptionAvailable: false,
  cardElevation: 1,
  widgetTrend: null,
  trendPeriod: null
}

export default withStyles(style)(WidgetCard)
