import React from 'react'
import { Grid, Select, MenuItem, Button, withStyles } from '@material-ui/core'
import { DateTimePicker } from '@material-ui/pickers'

const styles = theme => ({
  bottomSpacing: {
    marginBottom: theme.spacing(3)
  }
})

const TimePeriodSelector = withStyles(styles)(function({
  option,
  onOptionChange,
  onDateTimeChange,
  from,
  to,
  onSubmit,
  classes
}) {
  return (
    <Grid
      container
      justify="space-between"
      alignItems="flex-end"
      // className={classes.bottomSpacing}
    >
      <Grid item>
        <Select value={option} onChange={onOptionChange}>
          <MenuItem value="HOUR">Last Hour</MenuItem>
          <MenuItem value="DAY">Last Day</MenuItem>
          <MenuItem value="WEEK">Last Week</MenuItem>
          <MenuItem value="MONTH">Last Month</MenuItem>
          <MenuItem value="CUSTOM">Custom</MenuItem>
        </Select>
      </Grid>

      {option === 'CUSTOM' && (
        <Grid item>
          <Grid container spacing={4}>
            <Grid item>
              <DateTimePicker
                label="From"
                value={from}
                onChange={onDateTimeChange('from')}
              />
            </Grid>
            <Grid item style={{ paddingRight: 10 }}>
              <DateTimePicker
                label="To"
                value={to}
                onChange={onDateTimeChange('to')}
              />
            </Grid>
          </Grid>
        </Grid>
      )}

      <Grid item>
        <Button onClick={onSubmit} variant="outlined">
          Submit
        </Button>
      </Grid>
    </Grid>
  )
})

export default TimePeriodSelector
