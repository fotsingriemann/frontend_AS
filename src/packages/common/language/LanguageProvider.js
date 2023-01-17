import React, { Component } from 'react'

const LanguageContext = React.createContext()

export class LanguageProvider extends Component {
  state = {
    selectedLanguage: 'English',
    allLanguages: ['English', 'French'],
  }

  componentDidMount() {
    let language = localStorage.getItem('language')
    if (language) this.updateLanguage(language)
    else this.updateLanguage(this.state.selectedLanguage)
  }

  updateLanguage = (selectedLanguage) => this.setState({ selectedLanguage })

  render() {
    const { children } = this.props

    return (
      <LanguageContext.Provider
        value={{
          ...this.state,
          updateLanguage: this.updateLanguage,
        }}
      >
        {children}
      </LanguageContext.Provider>
    )
  }
}

export const LanguageConsumer = LanguageContext.Consumer
