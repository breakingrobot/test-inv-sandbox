const API_URL = "https://restcountries.eu/rest/v2";

export const fetchCountries = async (fields = []) => {
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
