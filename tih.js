const STB_URL = "https://api.stb.gov.sg";
const DATASET_API = "/content/common/v2/datasets";
const TIH_SEARCH_API = "/content/common/v2/search";
const MEDIA_DOWNLOAD_API = "/media/download/v2/";
const headertih = { 
  'x-api-key': 'XAmWJadZKDzaZNjoY9B5RzK9pmGhL8sz',
};

async function GetDataset()
{
  const url = `${CORS_URL}${STB_URL}${DATASET_API}`;
    const response = await axios.get(url,{
        headers : headertih
    });
  return response.data.data;
}

async function SearchSTB(searchtype,searchterms,offset)
{
  const url = `${CORS_URL}${STB_URL}${TIH_SEARCH_API}`;
  const response = await axios.get(url,{
      params: 
      {
        dataset : searchtype,
        keyword : searchterms,
        limit : 50,
        offset : offset
      },
      headers : headertih
  });
  // console.log(response.data);
  return response.data;
}

