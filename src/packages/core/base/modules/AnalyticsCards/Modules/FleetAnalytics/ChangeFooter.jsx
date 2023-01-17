import React from 'react'
import { Typography, makeStyles, colors } from '@material-ui/core'
import { ArrowUpward, ArrowDownward } from '@material-ui/icons'

const { green, red } = colors

const useFooterStyles = makeStyles(theme => ({
  upArrow: {
    color: green[500]
  },
  downArrow: {
    color: red[500]
  },
  percentageValue: {
    color: theme.palette.primary.main
  }
}))

function ChangeFooter({ changePercentage, analyticsPeriod }) {
  const classes = useFooterStyles()

  let Arrow
  let Value

  let since

  switch (analyticsPeriod) {
    case 'DAY':
      since = 'since last day'
      break
    case 'WEEK':
      since = 'since last week'
      break
    case 'MONTH':
      since = 'since last month'
      break
    default:
      since = ''
  }

  if (changePercentage >= 0) {
    Arrow = <ArrowUpward className={classes.upArrow} />
    Value = (
      <Typography>
        <b className={classes.percentageValue}>{changePercentage}% </b>
        {since}
      </Typography>
    )
  } else {
    Arrow = <ArrowDownward className={classes.downArrow} />
    Value = (
      <Typography>
        <b className={classes.percentageValue}>{-changePercentage}% </b>
        {since}
      </Typography>
    )
  }

  return (
    <React.Fragment>
      {Arrow}
      {Value}
    </React.Fragment>
  )
}

export default ChangeFooter
