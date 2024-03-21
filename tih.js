// File that calls to STB API on Custom API

/**
 * Function that gets datasets from stb to use for searching
 * @returns list of datasets from STB
 */
async function GetDataset()
{
  try
  {
    const url = `${API_URL}/Dataset`;
    const response = await axios.get(url);
    return response.data;
  }
  catch(error)
  {
    console.log(error.message)
  }
}

/**
 * Function that calls STB searh API
 * @param {String} searchtype Database to search from
 * @param {String} searchterms Terms to search by
 * @param {int} offset offset to get rest of search results
 * @returns 
 */
async function SearchSTB(searchtype,searchterms,offset)
{
  try
  {
    const url = `${API_URL}/TIH/Search`;
    const response = await axios.get(url,{
        params: 
        {
          type : searchtype,
          terms : searchterms,
          offset : offset
        }
    });
    return response.data.data;
  }
  catch(error)
  {
    console.log(error.message)
  }
}

