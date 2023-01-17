import React from 'react'
import { LanguageConsumer } from './LanguageProvider'

export default (Component) => (props) => (
  <LanguageConsumer>
    {({ allLanguages, selectedLanguage, updateLanguage }) => (
      <Component
        allLanguages={allLanguages}
        selectedLanguage={selectedLanguage}
        updateLanguage={updateLanguage}
        {...props}
      />
    )}
  </LanguageConsumer>
)
