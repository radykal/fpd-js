
import sstk from 'shutterstock-api'
fabric.express.setters.shutterstock = async function(options){

  sstk.setBasicAuth(options.key, options.secret);

  const api = new sstk.ImagesApi();

  const queryParams = {
    query: 'New York',
    sort: 'popular',
    orientation: 'horizontal'
  };

  try{
    let data = await api.searchImages(queryParams);
    console.log("shutterstock works");
  }catch(e){

  }
};
