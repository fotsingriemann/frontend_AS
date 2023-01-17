import React from 'react'
import PropTypes from 'prop-types'
import './VehicleStatCard.css'
import classNames from 'classnames'

import {
  withStyles,
  Grid,
  Typography,
  Paper,
  Tooltip,
  Zoom
} from '@material-ui/core'

const style = theme => ({
  statCard: {
    padding: 3
  },
  clickableCard: {
    cursor: 'pointer'
  },
  title: {
    color: 'inherit'
  },
  textCenter: {
    textAlign: 'center'
  },
  underlayCard: {
    textAlign: 'center',
    padding: theme.spacing(2),
    verticalAlign: 'middle'
  },
  textLeft: {
    textAlign: 'left'
  },
  textRight: {
    textAlign: 'right'
  }
})

function VehicleStatCard(props) {
  const { classes, onClick } = props

  return (
    <Tooltip TransitionComponent={Zoom} title={props.cardDescription}>
      <Paper
        elevation={4}
        onClick={e => {
          e.stopPropagation()
          onClick()
        }}
        className={classNames(
          onClick ? classes.clickableCard : '',
          classes.statCard
        )}
      >
        <Grid container alignItems="center">
          <Grid
            item
            xs={8}
            className={
              props.selected ? 'headerPaper-selected' : 'headerPaper-unselected'
            }
          >
            <Paper
              style={{
                margin: 6,
                padding: 6,
                textAlign: 'center',
                backgroundColor: props.headerBackgroundColor
              }}
              elevation={0}
            >
              <Typography
                variant="caption"
                className={classes.textLeft}
                style={{
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                {props.cardTitle}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Typography
              variant="subtitle2"
              style={{ color: 'black', textAlign: 'center' }}
            >
              {props.cardContent}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Tooltip>
  )
}

VehicleStatCard.propTypes = {
  height: PropTypes.string,
  cardTitle: PropTypes.string,
  cardClass: PropTypes.string,
  cardContent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cardDescription: PropTypes.string,
  headerBackgroundColor: PropTypes.string
}

VehicleStatCard.defaultProps = {
  height: 'auto',
  cardTitle: 'Title',
  cardClass: '',
  cardContent: '0000',
  headerBackgroundColor: '#1E88E5'
}

export default withStyles(style)(VehicleStatCard)
