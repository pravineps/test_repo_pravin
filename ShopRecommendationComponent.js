/* eslint-disable no-console */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable no-unused-vars */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable react/jsx-curly-newline */
/* eslint-disable no-trailing-spaces */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useHistory, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';
import lgAutoplay from 'lightgallery/plugins/autoplay';
import 'lightgallery/css/lg-autoplay.css';
import '../../assets/css/lightgallery.css';
import {
  LightgalleryItem,
  LightgalleryProvider,
  useLightgallery,
} from 'react-lightgallery';
import Linkify from 'react-linkify';
import ImageElement from '../../UI/ImageElement';
import { get, post } from '../../network/requests';
import { getUrl } from '../../network/urls';
import setRedirectPath from '../../actions/addRedirection';
import getLangValue from '../../resources/language';
import strings from '../../resources/strings';
import ShopAddRecommandation from './ShopAddRecommandation';
import DropdownElement from '../../UI/DropdownElement';
import { sortTypesList } from '../../constants/shopFilterOptions';
import useOutsideClick from '../Common/HandleOutSideClickClose';
import '../../assets/css/recommdation-style.css';
import '../../assets/css/create-user.css';
import '../../assets/css/add-shop-style.css';
import '../../assets/css/recommendation-details.css';
import { isAuthenticated } from '../../services/Auth';
import ButtonElement from '../../UI/ButtonElement';

function ShopRecommendationComponent({ shopDetails, getShopDetailsData }) {
  const { id } = useParams();
  const location = useLocation();
  const [shopdata, setshopdata] = useState(shopDetails);
  const lang = useSelector((state) => state.defaultLanguage.lang);

  const [sortType, setSortType] = useState(lang === 'en' ? 'Newest' : '最新');
  const refOutside = useRef(null);
  const [dropdownToggle, setdropdownToggle] = useState(false);

  useOutsideClick(refOutside, () => {
    if (dropdownToggle) {
      setdropdownToggle(false);
    }
  });

  const handleDropdownToggle = () => {
    setdropdownToggle(!dropdownToggle);
  };

  const handleOptionSelect = (title) => {
    handleDropdownToggle();
    setSortType(title);
  };

  useEffect(() => {
    if (lang === 'en') {
      switch (sortType) {
        case 'Newest':
          setSortType('Newest');
          break;
        case 'Most Popular':
          setSortType('Most Popular');
          break;
        case '最新':
          setSortType('Newest');
          break;
        case '最も人気のある':
          setSortType('Most Popular');
          break;
        default:
          break;
      }
    }
    if (lang === 'jp') {
      switch (sortType) {
        case 'Newest':
          setSortType('最新');
          break;
        case 'Most Popular':
          setSortType('最も人気のある');
          break;
        case '最新':
          setSortType('最新');
          break;
        case '最も人気のある':
          setSortType('最も人気のある');
          break;
        default:
          break;
      }
    }
  }, [lang]);
  
  const dispatch = useDispatch();
  // const [isLoading, setisLoading] = useState(false);
  const [recommdation, setRecommdation] = useState([]);

  useEffect(() => {
    switch (sortType) {
      case 'Most Popular':
      case '最も人気のある':
        return setRecommdation([...recommdation].sort((a, b) => b.up_vote_count - a.up_vote_count));
      default:
        return setRecommdation(shopDetails.reviews);
    }
  }, [sortType]);

  const formatReview = (review) => {
    if (review.length <= 500) {
      return `“ ${review} ”`;
    }
    return `“ ${review.substring(0, 500)} ...`;
  };

  function ReviewCard({ userData, review }) {
    const [showReview, setShowReview] = useState(formatReview(review));
    const [showSeeMore, setShowSeeMore] = useState(true);
    const toggleFullReview = () => {
      setShowReview(`“${review}”`);
      setShowSeeMore(false);
    };
    return (
      <Linkify>
        <p className="shopdetailrecomdescription">
          {showReview}
          { ' ' }
          { (review.length > 500 && showSeeMore)
            ? (
              <span role="button" onClick={toggleFullReview} onKeyPress={toggleFullReview} tabIndex="0">
                <em style={{ textDecorationLine: 'underline', cursor: 'pointer' }}>See More</em>
              </span>
            )
            : ''
          }
        </p>
      </Linkify>
    );
  }

  const history = useHistory();
  const handleDoVote = (reviewId, index) => {
    const cloneData = [...recommdation];
    cloneData[index].up_vote = cloneData[index].up_vote === 0 ? 1 : 0;
    cloneData[index].up_vote_count = cloneData[index].up_vote === 0 ? cloneData[index].up_vote_count - 1 : cloneData[index].up_vote_count + 1;
    setRecommdation(cloneData);
    // setisLoading(true);

    const data = {
      api_token: localStorage.getItem('token'),
      review_id: reviewId,
    };
    const url = getUrl('do-upvote');
    return post(`${url}`, data, false)
      .then((response) => {
        const {
          data: { messages, status, code },
        } = response;
        // setisLoading(false);
        switch (code) {
          case 200:
            if (status === 'true') {
              // getShopDetailsData();
            }
            break;
          case 400:
            if (isAuthenticated() !== true) {
              dispatch(setRedirectPath(location.pathname));
              history.push(`/${lang}/signup`);
            }
            // toast.error(messages, {
            //   pauseOnHover: false,
            //   position: toast.POSITION.TOP_RIGHT,
            // });
            break;
          default:
            toast.error(
              lang === 'en'
                ? process.env.REACT_APP_DEFAULT_ERROR_MESSAGE_EN
                : process.env.REACT_APP_DEFAULT_ERROR_MESSAGE_JP,
              {
                pauseOnHover: false,
                position: toast.POSITION.TOP_RIGHT,
              },
            );
        }
      })
      .catch((error) => {
        // setisLoading(false);
        const { message } = error;
        toast.error(message, {
          pauseOnHover: false,
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };
  const onClickuserprofile = (obj) => {
    if (isAuthenticated() === true) {
      dispatch(setRedirectPath(location.pathname));
      history.push(`/${lang}/user/${obj}`);
    } else {
      dispatch(setRedirectPath(location.pathname));
      history.push(`/${lang}/signup`);
    }
  };
  const OpenButtonWithHook = () => {
    const { openGallery } = useLightgallery();
    return (
      <ButtonElement
        className="btn btn-white-common btn-show-photos"
        id="open-show-photos-light-box"
        label="View all photos"
        onClick={() => openGallery('group1')}
      />
    );
  };
  const handleDoBookmark = (reviewId, index) => {
    const cloneData = [...recommdation];
    cloneData[index].bookmark = cloneData[index].bookmark === 0 ? 1 : 0;
    setRecommdation(cloneData);
    const data = {
      api_token: localStorage.getItem('token'),
      review_id: reviewId,
    };
    const url = getUrl('do-bookmark');
    return post(`${url}`, data, false)
      .then((response) => {
        const {
          data: { messages, status, code },
        } = response;
        // setisLoading(false);
        switch (code) {
          case 200:
            if (status === 'true') {
              // getShopDetailsData();
            }
            break;
          case 400:
            if (isAuthenticated() !== true) {
              dispatch(setRedirectPath(location.pathname));
              history.push(`/${lang}/signup`);
            }
            // toast.error(messages, {
            //   pauseOnHover: false,
            //   position: toast.POSITION.TOP_RIGHT,
            // });
            break;
          default:
            toast.error(
              lang === 'en'
                ? process.env.REACT_APP_DEFAULT_ERROR_MESSAGE_EN
                : process.env.REACT_APP_DEFAULT_ERROR_MESSAGE_JP,
              {
                pauseOnHover: false,
                position: toast.POSITION.TOP_RIGHT,
              },
            );
        }
      })
      .catch((error) => {
        // setisLoading(false);
        const { message } = error;
        toast.error(message, {
          pauseOnHover: false,
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };
  const handleusertext = (objid) => {
    if (isAuthenticated() !== true) {
      dispatch(setRedirectPath(location.pathname));
      history.push(`/${lang}/signup`);
    } else {
      history.push(`/${lang}/recommendation/${objid}`);
    }
  };
  useEffect(() => {
    getShopDetailsData();
  }, [lang]);
  useEffect(() => {
    setRecommdation(shopDetails.reviews);
  }, [shopDetails]);

  console.log('shopDetails', shopdata);
  return (
    <>
      {/* {isLoading && <Loader />} */}
      <div className="recommendations-div">
        <section className="create-user-middle-section shopdetailreccomandation">
          <div className="">
            <div className="recommendations-inner-div">
              <div className="recommendations-header-div">
                <h2>
                  {`${getLangValue(strings.STUDENT_OFFERS, lang)} (${
                    shopDetails.reviews.length
                  })`}
                </h2>
                <DropdownElement
                  refOutside={refOutside}
                  divId="sorting-select"
                  dropdownToggle={dropdownToggle}
                  toggle={handleDropdownToggle}
                  selectionOptions={sortTypesList}
                  selectedOption={sortType}
                  handleOptionSelect={(opt) => handleOptionSelect(opt)}
                />
              </div>
              <ShopAddRecommandation
                restaurantId={shopDetails.restaurant.id}
                getShopDetailsData={getShopDetailsData}
                editor={shopDetails.editor}
              />
              {recommdation && recommdation.length > 0 && (
                <div className="recommendations-body-div">
                  {recommdation.map((obj, index1) => (
                    <div className="create-user_inner shopdetailspage">
                      <div className="create-user-tab-block">
                        <div className="recommend-details-wrapper">
                          <div className="recommend-details-left shopdetailstitle">
                            <div onClick={() => handleusertext(obj.id)}>
                              <h3>{obj?.title}</h3>
                            </div>
                            <h5>
                              <div
                                onClick={() =>
                                  history.push(
                                    `/${lang}/shop/${obj.restaurant_id}`,
                                  )
                                }
                              >
                                {shopdata?.restaurant?.name}
                              </div>
                              <div onClick={() => handleusertext(obj.id)}>
                                {obj?.keywords?.map((data) => (
                                  <>
                                    {data.name === 'Event‎' && (
                                      <span>
                                        {getLangValue(strings.EVENTS, lang)}
                                      </span>
                                    )}
                                    {data.name === 'Product‎' && (
                                      <span>
                                        {getLangValue(strings.PRODUCTS, lang)}
                                      </span>
                                    )}
                                  </>
                                ))}
                              </div>
                            </h5>
                          </div>
                          <div className="user-tab-description-right">
                            <ul>
                              <li onClick={() => handleDoVote(obj?.id, index1)}>
                                <span
                                  className={
                                    obj?.up_vote !== 0
                                      ? 'bg-custom-icon up-arrow-icon active'
                                      : 'bg-custom-icon up-arrow-icon'
                                  }
                                />
                                <span
                                  className={
                                    obj?.up_vote !== 0 ? 'Arrowtext' : ''
                                  }
                                >
                                  {obj?.up_vote_count
                                    ? obj?.up_vote_count
                                    : null}{' '}
                                </span>
                              </li>
                              <li onClick={() => handleDoBookmark(obj?.id, index1)}>
                                <span
                                  className={
                                    obj?.bookmark !== 0
                                      ? 'bg-custom-icon bookmark-icon'
                                      : 'bg-custom-icon bookmark-outline-icon'
                                  }
                                />
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="recommend-para">
                          <ReviewCard review={obj.review} />
                        </div>
                        {/* {obj.imagesData > 0 && ( */}
                        <div className="create-user-tab-image">
                          <div className="photos-root-div">
                            <div className="row">
                              <div className="col-md-12">
                                <div className="gallery-light-box-root">
                                  <div className="gallery-light-box">
                                    <LightgalleryProvider
                                      plugins={[lgAutoplay]}
                                      speed={500}
                                      progressBar
                                      zoom={false}
                                      pager={false}
                                      fullScreen={false}
                                      share={false}
                                      counter
                                      autoplayControls
                                      galleryClassName="fixed-size-container"
                                    >
                                      <div className="row mlr-5 light-gallery-row">
                                        {obj.imagesData.map((objimg, index) => (
                                          <>
                                            {index < 4 ? (
                                              <LightgalleryItem
                                                itemClassName="col-lg-6 col-md-6 plr-5"
                                                group="group1"
                                                src={objimg.url}
                                                thumb={objimg.url}
                                              >
                                                <Link
                                                  to="#"
                                                  className="shopdetails"
                                                >
                                                  <ImageElement
                                                    src={objimg.url}
                                                    className="img-fluid img-responsive img-object-cover"
                                                    alt=""
                                                  />
                                                </Link>
                                              </LightgalleryItem>
                                            ) : (
                                              <LightgalleryItem
                                                itemClassName="col-lg-6 col-md-6 d-none plr-5"
                                                group="group1"
                                                src={objimg.url}
                                                thumb={objimg.url}
                                              >
                                                <Link
                                                  to="#"
                                                  className="light-gallery-link"
                                                >
                                                  <ImageElement
                                                    src={objimg.url}
                                                    className="img-fluid img-responsive img-object-cover"
                                                    alt=""
                                                  />
                                                </Link>
                                              </LightgalleryItem>
                                            )}
                                          </>
                                        ))}
                                      </div>
                                      {obj.imagesData.length > 4 && (
                                        <div className="view-all-btn-div custumshop">
                                          <OpenButtonWithHook />
                                        </div>
                                      )}
                                    </LightgalleryProvider>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* )} */}
                        <div className="create-user-tab-content">
                          <div className="create-user-tab-description">
                            <div
                              className="user-tab-description-left"
                              onClick={() => onClickuserprofile(obj?.userData?.user_id)}
                            >
                              <span className="user_thumb">
                                <ImageElement
                                  src={obj?.userData?.user_image}
                                  alt="image"
                                  className="img-fluid"
                                />
                              </span>
                              <div>
                                <p>{obj?.userData?.user_name}</p>
                                <p>
                                  {moment(obj.created_at).format('YYYY-MM-DD')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default ShopRecommendationComponent;
