import Masonry from "react-masonry-component";
import useLoading from "../../hooks/loadingHook";
import { searchGifs } from "../../requests/searchGifs";
import { Spinner, ModalAddGif } from "../../components";
import MayTheForce from "../../assets/images/maytheforce.gif";
import { useState } from "react";
import { useSelector } from "react-redux";
import { loadGifs } from "../../redux/gifs.slice";
import store from "../../redux/store";

import "./Main.scss";

export const Main = () => {
  const loading = useLoading(searchGifs);
  const loadingMore = useLoading("loadingMore");
  const [showModal, setShowModal] = useState(false);
  const [gifInfo, setGifInfo] = useState({});
  const gifs = useSelector((state) => state.gifs);
  const search = localStorage.getItem("search");
  let [offset, setOffset] = useState(20);

  async function loadMore() {
    if (offset > 0) {
      const req = await searchGifs(search, offset, "loadingMore");
      const result = req.data.data;
      if (result.length > 0) {
        result.forEach((res) => store.dispatch(loadGifs(res)));
        if (req.data.pagination.count < 20) {
          setOffset(0);
        } else {
          setOffset((offset += 20));
        }
      }
    }
  }

  const masonryOptions = {
    transitionDuration: 0,
    columnWidth: 200,
    fitWidth: true,
    gutter: 20,
  };

  return (
    <div className="gifs-list">
      {loading ? (
        <Spinner />
      ) : gifs.length > 0 ? (
        <Masonry
          className={"gifs-list-masonry"}
          id="gifsList"
          elementType={"ul"}
          options={masonryOptions}
          disableImagesLoaded={false}
          updateOnEachImageLoad={true}
        >
          {gifs.map((gif, i) => {
            return (
              <li
                key={i}
                onClick={() => {
                  setGifInfo({
                    title: gif.title,
                    image: gif.images.fixed_width.url,
                    giphy: gif.url,
                  });
                  setShowModal(true);
                }}
              >
                <img src={gif.images.fixed_width.url} alt={gif.title} />
                <span>Ver detalhes</span>
              </li>
            );
          })}
        </Masonry>
      ) : (
        <div className="gifs-list-intro">
          <span>Faça sua busca no campo acima!</span>
          <img src={MayTheForce} alt="May the force be with you" />
        </div>
      )}
      {loadingMore && <Spinner />}
      {offset > 0 && !loadingMore && gifs.length > 0 && !loading && (
        <span onClick={() => loadMore()}>Carregar mais</span>
      )}
      <ModalAddGif
        title={gifInfo.title}
        image={gifInfo.image}
        giphy={gifInfo.giphy}
        show={showModal}
        modalClosed={() => setShowModal(false)}
      />
    </div>
  );
};
