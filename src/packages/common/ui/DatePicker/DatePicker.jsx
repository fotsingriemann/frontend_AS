/**
 * @module DatePicker
 * @summary This module exports CustomDatePicker component
 */
import React from 'react'
import { Grid, Select, MenuItem, Button, withStyles } from '@material-ui/core'
import { DateTimePicker } from '@material-ui/pickers'

const styles = theme => ({
  bottomSpacing: {
    marginBottom: theme.spacing(3)
  }
})

/**
 * CustomDatePicker component is a reusable component to render DatePicker with a dropdown for
 * frequently used time periods
 * @summary CustomDatePicker component
 */
function CustomDatePicker(props) {
  const { option, onOptionChange, onDateChange, from, to, onSubmit } = props

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
        <Grid item>
          <Grid container>
            <Grid item style={{ paddingRight: 10 }}>
              <DateTimePicker
                label="From"
                value={from}
                onChange={onDateChange('from')}
              />
            </Grid>
            <Grid item style={{ paddingRight: 10 }}>
              <DateTimePicker
                label="To"
                value={to}
                onChange={onDateChange('to')}
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
}

export default withStyles(styles)(CustomDatePicker)
