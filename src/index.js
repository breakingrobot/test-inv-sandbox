/* global $ */
const API_URL = "https://restcountries.eu/rest/v2";

const fetchCountries = async (fields = []) => {
  const persistedCountries = JSON.parse(
    localStorage.getItem("countries") || "[]"
  );

  if (persistedCountries && persistedCountries.length > 0) {
    return persistedCountries;
  }

  const fieldString = fields.length > 0 ? fields.join(";") : "";
  const searchParam = new URLSearchParams({
    fields: fieldString
  });

  const requestUrl = `${API_URL}/all?${searchParam}`;
  const response = await fetch(requestUrl);
  const countries = await response.json();

  if (countries.length === 0) {
    throw new Error("No countries data was provided by the");
  }

  localStorage.setItem("countries", JSON.stringify(countries));

  return countries;
};

$(async () => {
  const countriesList = await fetchCountries();

  const findCountryByCode = (code = "") =>
    countriesList.find(({ alpha3Code }) => code === alpha3Code);

  const renderCountryContent = (country) => {
    const {
      flag = "",
      nativeName = "",
      population = 0,
      timezones = [],
      currencies = [],
      languages = [],
      capital = "",
      borders = []
    } = country;

    const formattedCurrencies = currencies
      .map(({ name, code }) => `<li>${name} (${code})</li>`)
      .join("");

    const formattedLanguages = languages
      .map(({ name, iso639_2 }) => `<li>${name} (${iso639_2})</li>`)
      .join("");

    const formattedTimezones = timezones
      .map((value) => `<li>${value}</li>`)
      .join("");

    const formattedBorders = borders
      .map((value) => {
        const country = findCountryByCode(value);
        const { name = "" } = country;

        return `<li>${name}</li>`;
      })
      .join("");

    const $countryContentTemplate = $("#country-content-template").html();
    const $content = $($countryContentTemplate).clone();

    $content
      .find("#country-img")
      .attr("src", flag)
      .attr("width", 250)
      .addClass("img-fluid rounded mx-auto d-block");

    $content.find("#native-name").html(nativeName);

    $content.find("#capital").html(capital);

    $content.find("#population").html(population);

    $content.find("#currencies").html(`<ul>${formattedCurrencies}</ul>`);

    $content.find("#languages").html(`<ul>${formattedLanguages}</ul>`);

    $content.find("#timezones").html(`<ul>${formattedTimezones}</ul>`);

    $content.find("#borders").html(`<ul>${formattedBorders}</ul>`);

    const $previousContent = $("#country-content");

    $previousContent.replaceWith($content);
  };

  const onClickCountry = (e) => {
    const { currentTarget } = e;

    const $countriesList = $("#countries-list");

    $countriesList.find(".active").removeClass("active");

    const element = $(currentTarget);
    const code = element.data("code");
    const country = findCountryByCode(code);

    element.addClass("active");

    renderCountryContent(country);
  };

  const renderCountryList = (countries) =>
    countries.forEach((country) => {
      const { name = "", alpha3Code = "" } = country;
      const { alpha3Code: firstAlphaCode = "" } = countries[0];

      const isFirstCountry = firstAlphaCode === alpha3Code;

      const $divTemplate = $("#country-template").html();
      const $countriesList = $("#countries-list");

      const $element = $($divTemplate).clone();
      const $countryCode = $("<span>")
        .addClass("fw-light fs-6")
        .html(alpha3Code);
      const $countryName = $("<p>").addClass("fs-3").html(name);
      $element.append($countryCode);
      $element.append($countryName);
      $element.attr("data-code", alpha3Code);
      $element.click(onClickCountry);

      if (isFirstCountry) {
        $element.addClass("active");
      }

      $countriesList.append($element);
    });

  renderCountryList(countriesList);
  renderCountryContent(countriesList[0]);
});
