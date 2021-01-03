const transformStats = (statistics) => {
  const { msa, county, countyPep, tract } = statistics;

  // Format values representing dollars
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  /**
   * Helper function that takes the Census data and a dictionary
   * of Census variable name equivalents and returns the top three
   * by value in descending order.
   * @param {object} geography
   * @param {object} dictionary
   */
  const getTopThree = (geography, dictionary) => {
    const keyArr = Object.keys(dictionary);
    const filtered = Object.entries(geography)
      .filter((entry) => {
        if (keyArr.includes(entry[0])) {
          entry[0] = dictionary[entry[0]];
          return entry;
        }
      })
      .sort((a, b) => b[1] - a[1]);

    return {
      first: `${filtered[0][0]} (${filtered[0][1]}%)`,
      second: `${filtered[1][0]} (${filtered[1][1]}%)`,
      third: `${filtered[2][0]} (${filtered[2][1]}%)`,
    };
  };

  /**
   * Return the top industries for a given geography
   * @param {object} geography
   */
  const topIndustries = (geography) => {
    const industries = {
      DP03_0033PE: "Agriculture, forestry, fishing and hunting, and mining",
      DP03_0034PE: "Construction",
      DP03_0035PE: "Manufacturing",
      DP03_0036PE: "Wholesale trade",
      DP03_0037PE: "Retail trade",
      DP03_0038PE: "Transportation and warehousing, and utilities",
      DP03_0039PE: "Information",
      DP03_0040PE:
        "Finance and insurance, and real estate and rental and leasing",
      DP03_0041PE:
        "Professional, scientific, and management, and administrative and waste management services",
      DP03_0042PE:
        "Educational services, and health care and social assistance",
      DP03_0043PE:
        "Arts, entertainment, and recreation, and accommodation and food services",
      DP03_0044PE: "Other services, except public administration",
      DP03_0045PE: "Public administration",
    };
    return getTopThree(geography, industries);
  };

  /**
   * Return the top occupations for a given geography
   * @param {object} geography
   */
  const topOccupations = (geography) => {
    const occupations = {
      DP03_0027PE: "Management, business, science, and arts occupations",
      DP03_0028PE: "Service occupations",
      DP03_0029PE: "Sales and office occupations",
      DP03_0030PE:
        "Natural resources, construction, and maintenance occupations",
      DP03_0031PE:
        "Production, transportation, and material moving occupations",
    };
    return getTopThree(geography, occupations);
  };

  const topThreeIndustries = {
    tract: topIndustries(tract),
    county: topIndustries(county),
    msa: topIndustries(msa),
  };

  const topThreeOccupations = {
    tract: topOccupations(tract),
    county: topOccupations(county),
    msa: topOccupations(msa),
  };

  const priceToRentRatio = (geography) => {
    return (geography.DP04_0089E / (geography.DP04_0134E * 12))
      .toFixed(2)
      .toString();
  };

  function calcPopStats(popStats) {
    const popDiff = [];
    for (let i = 0; i < popStats.length - 1; i++) {
      popDiff.push({
        growthOrDecline: popStats[i + 1]["POP"] - popStats[i]["POP"],
        populationTotal: parseInt(popStats[i]["POP"]),
      });
    }
    const cumulativeGrowthOrDecline = popDiff.reduce(
      (acc, cv) => acc + cv.growthOrDecline,
      0
    );
    const averageTotalPopulation =
      popDiff.reduce((acc, cv) => acc + cv.populationTotal, 0) / popDiff.length;
    return ((cumulativeGrowthOrDecline / averageTotalPopulation) * 100)
      .toFixed(2);
  }

  return {
    economic: [
      {
        statistic: "Price-to-rent ratio",
        advisory: "(Lower is better)",
        CT: priceToRentRatio(tract),
        CTY: priceToRentRatio(county),
        MSA: priceToRentRatio(msa),
      },
      {
        statistic: "Rental vacancy rate",
        CT: `${tract.DP04_0005E}%`,
        CTY: `${county.DP04_0005E}%`,
        MSA: `${msa.DP04_0005E}%`,
      },
      {
        statistic: "Median household income",
        CT: currencyFormatter.format(tract.DP03_0062E),
        CTY: currencyFormatter.format(county.DP03_0062E),
        MSA: currencyFormatter.format(msa.DP03_0062E),
      },
      {
        statistic: "Top three sectors",
        advisory: "(Ordered by percentage of working population employed)",
        CT: [
          topThreeIndustries.tract.first,
          topThreeIndustries.tract.second,
          topThreeIndustries.tract.third,
        ],
        CTY: [
          topThreeIndustries.county.first,
          topThreeIndustries.county.second,
          topThreeIndustries.county.third,
        ],
        MSA: [
          topThreeIndustries.msa.first,
          topThreeIndustries.msa.second,
          topThreeIndustries.msa.third,
        ],
      },
      {
        statistic: "Top three occupations",
        advisory: "(Ordered by percentage of working population in occupation)",
        CT: [
          topThreeOccupations.tract.first,
          topThreeOccupations.tract.second,
          topThreeOccupations.tract.third,
        ],
        CTY: [
          topThreeOccupations.county.first,
          topThreeOccupations.county.second,
          topThreeOccupations.county.third,
        ],
        MSA: [
          topThreeOccupations.msa.first,
          topThreeOccupations.msa.second,
          topThreeOccupations.msa.third,
        ],
      },
    ],

    demographic: [
      {
        statistic: "Population growth rate",
        advisory: "(Higher is better)",
        CT: "N/A",
        CTY: `${calcPopStats(countyPep)}%`,
        MSA: "2.18%",
      },
      {
        statistic: "Median age",
        CT: `${tract.DP05_0018E}`,
        CTY: `${county.DP05_0018E}`,
        MSA: `${msa.DP05_0018E}`,
      },
      {
        statistic: "Race and ethnicity",
        CT: [
          `American Indian (${tract.DP05_0039PE}%)`,
          `Asian (${tract.DP05_0044PE}%)`,
          `Black (${tract.DP05_0038PE}%)`,
          `Pacific Islander (${tract.DP05_0052PE}%)`,
          `White (${tract.DP05_0037PE}%)`,
          `Other (${(tract.DP05_0057PE + tract.DP05_0058PE).toFixed(1)}%)`,
        ],
        CTY: [
          `American Indian (${county.DP05_0039PE}%)`,
          `Asian (${county.DP05_0044PE}%)`,
          `Black (${county.DP05_0038PE}%)`,
          `Pacific Islander (${county.DP05_0052PE}%)`,
          `White (${county.DP05_0037PE}%)`,
          `Other (${(county.DP05_0057PE + county.DP05_0058PE).toFixed(1)}%)`,
        ],
        MSA: [
          `American Indian (${msa.DP05_0039PE}%)`,
          `Asian (${msa.DP05_0044PE}%)`,
          `Black (${msa.DP05_0038PE}%)`,
          `Pacific Islander (${msa.DP05_0052PE}%)`,
          `White (${msa.DP05_0037PE}%)`,
          `Other (${(msa.DP05_0057PE + msa.DP05_0058PE).toFixed(1)}%)`,
        ],
      },
      {
        statistic: "Unemployment rate",
        CT: `${tract.DP03_0009PE}%`,
        CTY: `${county.DP03_0009PE}%`,
        MSA: `${msa.DP03_0009PE}%`,
      },
    ],
  };
};

module.exports = {
  transformStats,
};
