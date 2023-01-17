import React from 'react'
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio
} from '@material-ui/core'
import RoundedPaper from '@zeliot/common/ui/RoundedPaper'

function PeriodSelector({ analyticsPeriod, setAnalyticsPeriod }) {
  function handleChange(e) {
    setAnalyticsPeriod(e.target.value)
  }

  return (
    <RoundedPaper style={{ height: '100%', width: '100%', padding: 16 }}>
      <FormControl component="fieldset">
        <FormLabel component="legend">Time Period</FormLabel>
        <RadioGroup
          color="primary"
          aria-label="Period Selector"
          name="time-period"
          value={analyticsPeriod}
          onChange={handleChange}
        >
          <FormControlLabel
            value="DAY"
            control={<Radio color="primary" />}
            label="Last Day"
          />

          <FormControlLabel
            value="WEEK"
            control={<Radio color="primary" />}
            label="Last Week"
          />

          <FormControlLabel
            value="MONTH"
            control={<Radio color="primary" />}
            label="Last Month"
          />

          <FormControlLabel
            value="ALL_TIME"
            control={<Radio color="primary" />}
            label="All Time"
          />
        </RadioGroup>
      </FormControl>
    </RoundedPaper>
  )
}

export default PeriodSelector
