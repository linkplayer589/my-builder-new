export interface TranslationService {
  translate(text: string, targetLanguage: string): Promise<string>
}

export class AzureTranslationService implements TranslationService {
  private endpoint = "https://api.cognitive.microsofttranslator.com"
  private subscriptionKey: string
  private region: string

  constructor(subscriptionKey: string, region: string = "global") {
    this.subscriptionKey = subscriptionKey
    this.region = region
  }

  async translate(text: string, targetLanguage: string): Promise<string> {
    if (targetLanguage === "en" || !text.trim()) {
      return text
    }

    try {
      const response = await fetch(
        `${this.endpoint}/translate?api-version=3.0&to=${targetLanguage}`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": this.subscriptionKey,
            "Ocp-Apim-Subscription-Region": this.region,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([{ Text: text }]),
        }
      )

      if (!response.ok) {
        throw new Error(`Azure Translation failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data[0].translations[0].text
    } catch (error) {
      console.error("Translation error:", error)
      throw error
    }
  }
}
