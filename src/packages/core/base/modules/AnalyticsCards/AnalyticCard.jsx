import React from 'react'
import clsx from 'clsx'
import { Typography, makeStyles } from '@material-ui/core'
import RoundedPaper from '@zeliot/common/ui/RoundedPaper'

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'row-reverse',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left',
    backgroundSize: '50%',
    minHeight: 150
  },
  clickableCard: {
    cursor: 'pointer',
    '&:hover': {
      boxShadow: theme.shadows[5]
    }
  },
  backgroundLeft: {
    backgroundPosition: 'left'
  },
  backgroundCenter: {
    backgroundPosition: 'center'
  },
  columnContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  centerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stretch: {
    flex: 1
  },
  paperContainer: {
    padding: theme.spacing(2),
    height: '100%'
  }
}))

function AnalyticCard(props) {
  const { header, value, image, footer, onClick, isClickable } = props

  const classes = useStyles()

  let backgroundClass

  if (value) {
    backgroundClass = classes.backgroundLeft
  } else {
    backgroundClass = classes.backgroundCenter
  }

  return (
    <RoundedPaper
      className={clsx(classes.paperContainer, {
        [classes.clickableCard]: isClickable
      })}
      onClick={onClick}
    >
      <div
        className={clsx(classes.container, backgroundClass)}
        style={{
          backgroundImage: `url(${image})`
        }}
      >
        <div className={classes.columnContainer}>
          <div>
            <Typography variant="h6" color="primary">
              {header}
            </Typography>
          </div>

          <div className={clsx(classes.centerContainer, classes.stretch)}>
            <Typography variant="h6">{value}</Typography>
          </div>
        </div>
      </div>

      <div className={classes.centerContainer}>{footer}</div>
    </RoundedPaper>
  )
}

export default AnalyticCard
