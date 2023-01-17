import React from 'react'
import { Grid, Select, MenuItem, Button, withStyles } from '@material-ui/core'
import { DateTimePicker } from '@material-ui/pickers'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const styles = (theme) => ({
  bottomSpacing: {
    marginBottom: theme.spacing(3),
  },
})

const TimePeriodSelector = withStyles(styles)(function ({
  option,
  onOptionChange,
  onDateTimeChange,
  from,
  to,
  onSubmit,
  classes,
  selectedLanguage,
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
          <MenuItem value="HOUR">
            {languageJson[selectedLanguage].common.dateFilter.lastHour}
          </MenuItem>
          <MenuItem value="DAY">
            {languageJson[selectedLanguage].common.dateFilter.lastDay}
          </MenuItem>
          <MenuItem value="WEEK">
            {languageJson[selectedLanguage].common.dateFilter.lastWeek}
          </MenuItem>
          <MenuItem value="MONTH">
            {languageJson[selectedLanguage].common.dateFilter.lastMonth}
          </MenuItem>
          <MenuItem value="CUSTOM">
            {languageJson[selectedLanguage].common.dateFilter.custom}
          </MenuItem>
        </Select>
      </Grid>

      {option === 'CUSTOM' && (
        <Grid item>
          <Grid container spacing={4}>
            <Grid item>
              <DateTimePicker
                label={
                  languageJson[selectedLanguage].common.dateFilter.fromDate
                }
                value={from}
                onChange={onDateTimeChange('from')}
              />
            </Grid>
            <Grid item style={{ paddingRight: 10 }}>
              <DateTimePicker
                label={languageJson[selectedLanguage].common.dateFilter.toDate}
                value={to}
                onChange={onDateTimeChange('to')}
              />
            </Grid>
          </Grid>
        </Grid>
      )}

      <Grid item>
        <Button onClick={onSubmit} variant="outlined">
          {languageJson[selectedLanguage].common.submitButtonTitle}
        </Button>
      </Grid>
    </Grid>
  )
})

export default withLanguage(TimePeriodSelector)
