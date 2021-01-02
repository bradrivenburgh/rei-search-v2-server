
const transformStats = (statistics) => {
  const { msa, county, tract } = statistics;



  return {
    economic: [
      {
        id: 1,
        statistic: "Price-to-rent ratio",
        advisory: "(Lower is better)",
        CT: "18.00",
        CTY: "18.20",
        MSA: "18.30",
      },
      {
        id: 2,
        statistic: "Median income",
        CT: "$40,000",
        CTY: "$40,000",
        MSA: "$40,000",
      },
      {
        id: 3,
        statistic: "Top three sectors",
        advisory: "(Ordered by percentage of working population employed)",
        CT: [
          "Health care and social assistance (19.29%)",
          "Retail trade (18.29%)",
          "Accommodation and food services (8.75%)",
        ],
        CTY: [
          "Health care and social assistance (19.29%)",
          "Retail trade (18.29%)",
          "Accommodation and food services (8.75%)",
        ],
        MSA: [
          "Health care and social assistance (19.29%)",
          "Retail trade (18.29%)",
          "Accommodation and food services (8.75%)",
        ],
      },
      {
        id: 4,
        statistic: "Top three occupations",
        advisory: "(Ordered by percentage of working population in occupation)",
        CT: [
          "Health care and social assistance (19.29%)",
          "Retail trade (18.29%)",
          "Accommodation and food services (8.75%)",
        ],
        CTY: [
          "Health care and social assistance (19.29%)",
          "Retail trade (18.29%)",
          "Accommodation and food services (8.75%)",
        ],
        MSA: [
          "Health care and social assistance (19.29%)",
          "Retail trade (18.29%)",
          "Accommodation and food services (8.75%)",
        ],
      },
    ],
  
    demographic: [
      {
        id: 1,
        statistic: "Population growth rate",
        advisory: "(Higher is better)",
        CT: "2.18%",
        CTY: "2.40%",
        MSA: "2.00%",
      },
      {
        id: 2,
        statistic: "Median age",
        CT: tract.DP05_0018E,
        CTY: county.DP05_0018E,
        MSA: msa.DP05_0018E,
      },
      {
        id: 3,
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
        id: 4,
        statistic: "Employment status",
        CT: ["Employed (##%)", "Unemployed (##%)"],
        CTY: ["Employed (##%)", "Unemployed (##%)"],
        MSA: ["Employed (##%)", "Unemployed (##%)"],
      },
    ],  
  };

};

module.exports = {
  transformStats
}

