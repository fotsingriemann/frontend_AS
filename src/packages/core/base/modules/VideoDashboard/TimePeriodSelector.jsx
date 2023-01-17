import React from 'react'
import { Grid, Select, MenuItem, Button } from '@material-ui/core'
import { DateTimePicker } from '@material-ui/pickers'

function TimePeriodSelector(props) {
  const { option, onOptionChange, onDateTimeChange, from, to, onSubmit } = props

  return (
    <Grid container justify="space-between" alignItems="flex-end">
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
        <React.Fragment>
          <Grid item>
            <Grid container>
              <Grid item style={{ paddingRight: 10 }}>
                <DateTimePicker
                  label="From"
                  value={from}
                  onChange={onDateTimeChange('customFromTime')}
                />
              </Grid>

              <Grid item style={{ paddingRight: 10 }}>
                <DateTimePicker
                  label="To"
                  value={to}
                  onChange={onDateTimeChange('customToTime')}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            <Button onClick={onSubmit} variant="outlined">
              Submit
            </Button>
          </Grid>
        </React.Fragment>
      )}
    </Grid>
  )
}

export default TimePeriodSelector
