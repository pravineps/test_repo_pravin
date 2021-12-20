/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { post } from '../../network/requests';
import { getUrl } from '../../network/urls';
import getLangValue from '../../resources/language';
import strings from '../../resources/strings';
import { tokenExpire } from '../../services/Auth';
import ButtonElement from '../../UI/ButtonElement';
import Loader from '../../UI/Loader/Loader';
import { isToken } from '../../utils/functions';
import CategoriesComponent from '../AddPlace/CategoriesComponent';
import { getRecommdationType } from '../../constants/placeCategories';

toast.configure();
function ShopAddRecommandation({ restaurantId, getShopDetailsData, editor }) {
  const history = useHistory();
  const [showAddRecommand, setShowAddRecommand] = useState(false);
  const [previewUrl, setPreviewUrl] = useState([]);
  const [recommendation, setRecommandation] = useState('');
  const [recommendationError, setRecommandationError] = useState('');
  const [termsConditionError, setTermsConditionError] = useState('');
  const [minimumExpenseError, setMinimumExpenseError] = useState('');
  const [title, setTitle] = useState('');
  const [termsCondition, setTermsCondition] = useState('');
  const [minimumExpense, setMinimumExpense] = useState('');
  const [imageError, setImageError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [isEditor, setIsEditor] = useState(false);
  const [recommdationType, setRecommdationType] = useState([]);
  const [selectedRecommdationTypeError, setSelectedRecommdationTypeError] = useState('');
  const [selectedRecommdationType, setSelctedRecommdationType] = useState([]);
  const lang = useSelector((state) => state.defaultLanguage.lang);

  let showRecommendButton;
  if (editor !== false) {
    showRecommendButton = true;
  } else {
    showRecommendButton = false;
  }
  // console.log(editor);
  const onSelectFile = (e) => {
    let tempUrl = [];
    setImageError('');
    if (!e.target.files || e.target.files.length === 0) {
      //   setSelectedFile(undefined);
      setImageError(getLangValue(strings.ERR_PHOTO_REQUIRED, lang));
      return;
    }
    tempUrl = [...previewUrl];
    if (e.target.files.length === 1) {
      if (!e.target.files[0].type.match('image.*')) {
        setImageError(getLangValue(strings.WRONG_IMAGE_TYPE, lang));
        return;
      }
      tempUrl.push(e.target.files[0]);
    } else if (e.target.files.length > 1) {
      Array.from(e.target.files).forEach((item) => {
        if (!item.type.match('image.*')) {
          setImageError(getLangValue(strings.WRONG_IMAGE_TYPE, lang));
          return;
        }
        tempUrl.push(item);
      });
    }

    setPreviewUrl([...tempUrl]);
  };
  const handleCancel = () => {
    setShowAddRecommand(false);
    setPreviewUrl('');
    setRecommandation('');
    const recommdationtype = getRecommdationType(lang);
    setRecommdationType(recommdationtype);
    setSelctedRecommdationType([]);
    setRecommandationError('');
    setTermsConditionError('');
    setMinimumExpenseError('');
    setTitle('');
    setTermsCondition('');
    setMinimumExpense('');
  };
  const handleAddRecommandtion = () => {
    if (!isToken()) {
      history.push(`/${lang}/login`);
    } else {
      setShowAddRecommand(!showAddRecommand);
    }
  };
  const handleChangeRecommandation = (e) => {
    setRecommandation(e.target.value);
    if (e.target.value === '') {
      setRecommandationError(getLangValue(strings.ERR_DETAIL_REQUIRED, lang));
    } else {
      setRecommandationError('');
    }
  };
  const handleChangeTitle = (e) => {
    setTitle(e.target.value);
  };

  const handleChangeTermsCondition = (e) => {
    setTermsCondition(e.target.value);
    if (e.target.value === '') {
      setTermsConditionError(getLangValue(strings.ERR_TERMS_CONDITION, lang));
    } else {
      setTermsConditionError('');
    }
  };

  const handleChangeMinimumExpense = (e) => {
    setMinimumExpense(e.target.value);
    if (e.target.value === '') {
      setMinimumExpenseError(getLangValue(strings.ERR_MINIMUM_EXPENSE, lang));
    } else {
      setMinimumExpenseError('');
    }
  };

  const handleCancelImage = (i) => {
    const tempPreviewUrl = [...previewUrl];
    tempPreviewUrl.forEach((item, index) => {
      if (index === i) {
        tempPreviewUrl.splice(index, 1);
      }
    });
    setPreviewUrl(tempPreviewUrl);
  };
  const isFormValidation = () => {
    let isValid = true;
    if (previewUrl.length < 1) {
      setImageError(getLangValue(strings.ERR_PHOTO_REQUIRED, lang));
      isValid = false;
    } else if (imageError === getLangValue(strings.WRONG_IMAGE_TYPE, lang)) {
      isValid = false;
    }

    if (recommendation === '') {
      setRecommandationError(getLangValue(strings.ERR_DETAIL_REQUIRED, lang));
      isValid = false;
    }

    if (termsCondition === '') {
      setTermsConditionError(getLangValue(strings.ERR_TERMS_CONDITION, lang));
      isValid = false;
    }

    if (minimumExpense === '') {
      setMinimumExpenseError(getLangValue(strings.ERR_MINIMUM_EXPENSE, lang));
      isValid = false;
    }

    return isValid;
  };
  const handleSubmit = () => {
    const token = localStorage.getItem('token');
    const isValid = isFormValidation();
    if (isValid) {
      setIsLoading(true);
      const addRecommandationData = new FormData();
      for (let i = 0; i < previewUrl.length; i += 1) {
        addRecommandationData.append('reviews[]', previewUrl[i]);
      }
      addRecommandationData.append('review', recommendation);
      addRecommandationData.append('recommend', 1);
      addRecommandationData.append('lang', lang);
      addRecommandationData.append('type', 'shop');
      addRecommandationData.append('restaurant_id', restaurantId);
      addRecommandationData.append('recommend', 1);
      addRecommandationData.append('reviewkeywords', selectedRecommdationType);
      addRecommandationData.append('title', title);
      addRecommandationData.append('terms_conditions', termsCondition);
      addRecommandationData.append('minimum_expense', minimumExpense);
      const recommdationtype = getRecommdationType(lang);
      const url = getUrl('add-recommandation');
      post(`${url}?api_token=${token}`, addRecommandationData, false)
        .then((response) => {
          const {
            data: { messages, status, code },
          } = response;
          setIsLoading(false);
          switch (code) {
            case 200:
              if (status === 'true') {
                getShopDetailsData();
                toast.success(messages, {
                  pauseOnHover: false,
                  position: toast.POSITION.TOP_RIGHT,
                });
              }
              setShowAddRecommand(false);
              setPreviewUrl('');
              setRecommandation('');
              setRecommdationType(recommdationtype);
              setSelctedRecommdationType([]);
              setRecommandationError('');
              setTermsConditionError('');
              setMinimumExpenseError('');
              setTitle('');
              setTermsCondition('');
              setMinimumExpense('');
              break;
            case 400:
              toast.error(messages, {
                pauseOnHover: false,
                position: toast.POSITION.TOP_RIGHT,
              });
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
          setIsLoading(false);
          tokenExpire(error.response, history);
        });
    }
  };
  const onClickrecommdationType = (e, id) => {
    // e.preventDefault();
    let updateCheckKeyword = [];
    setSelectedRecommdationTypeError('');
    const tempCategory1 = [...recommdationType];
    updateCheckKeyword = [...selectedRecommdationType];
    tempCategory1.map((item) => {
      if (item.id === id) {
        item.is_selected = item.is_selected === '0' ? '1' : '0';
        if (item.is_selected === '1') {
          updateCheckKeyword.push(item.name.toLowerCase().replace('s', ''));
        } else {
          const indexCheck = updateCheckKeyword.indexOf(item);
          updateCheckKeyword.splice(indexCheck, 1);
        }
        setSelctedRecommdationType(updateCheckKeyword);
      }
      return item;
    });
    setRecommdationType(tempCategory1);
  };
  useEffect(() => {
    const recommdationtype = getRecommdationType(lang);

    setRecommdationType(recommdationtype);
  }, [lang]);
  return (
    <>
      {isLoading && <Loader /> }
      <div className="add-recommendation-form-div">
        {showRecommendButton && !showAddRecommand && (

        <div className="btn-add-div" id="add-recommendation-btn-div">
          <div className="add-button-card-root">
            <ButtonElement className="btn btn-recommendation-button" label={`+ ${getLangValue(strings.ADD_STUDENT, lang)}`} id="btn-recommendation-button" onClick={() => handleAddRecommandtion()} />
          </div>
        </div>
        )}
        <div className={`add-recommendation-form-card-root ${!showAddRecommand && 'd-none'} `} id="add-recommendation-form-card">
          <div className="add-recommendation-form-card">

            <div className="file-div">
              <div className="custom-file">
                <input type="file" className="custom-file-input" id="customFile" multiple onChange={(e) => onSelectFile(e)} />
                <label className="custom-file-label" htmlFor="customFile">
                  {' '}
                  <i className="bg-custom-icon image-icon" />
                  {' '}
                  {getLangValue(strings.ADD_PHOTOS, lang)}
                </label>
              </div>
              <div className="img-list-div">
                <div className="row mlr-8">
                  {previewUrl && previewUrl.length > 0 && previewUrl.map((image, i) => (
                    <div className="col-lg-3 col-md-3 col-6 plr-8">
                      <div className="image-bx">
                        <div className="cancel-div">
                          {' '}
                          <ButtonElement label={<i className="fe fe-x" />} type="button" className="btn btn-link btn-cancel" onClick={() => handleCancelImage(i)} />
                          {' '}
                        </div>
                        <div className="image-bx-inner">
                          <img src={URL.createObjectURL(image)} alt="img" className="img-fluid img-object-cover" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {imageError !== '' ? (
                  <div className="invalid-feedback d-block">
                    {imageError}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="form-custom-div">
              <div className="row">
                <div className="col-lg-12 col-md-12">
                  <div className="form-group mb-20">
                    <div className="input-control-div custom-label-box-root">
                      <CategoriesComponent
                        categories={recommdationType}
                        onClickCatgory={onClickrecommdationType}
                      />
                      {selectedRecommdationTypeError !== '' ? (
                        <div className="invalid-feedback d-block">
                          {selectedRecommdationTypeError}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="textarea-dvi">
              <input className="form-control" placeholder={getLangValue(strings.TITLE, lang)} maxLength="63" value={title} onChange={handleChangeTitle} />
              <textarea className="form-control" value={recommendation} onChange={handleChangeRecommandation} cols="30" rows="3" placeholder={getLangValue(strings.WRITE_DETAIL, lang)} />
              {recommendationError !== '' ? (
                <div className="invalid-feedback d-block">
                  {recommendationError}
                </div>
              ) : null}
              <input className="form-control" placeholder={getLangValue(strings.TERMS_AND_CONDITION, lang)} maxLength="63" value={termsCondition} onChange={handleChangeTermsCondition} />
              {termsConditionError !== '' ? (
                <div className="invalid-feedback d-block">
                  {termsConditionError}
                </div>
              ) : null}
              <input type="number" className="form-control" placeholder={getLangValue(strings.MINIMUM_EXPENSE, lang)} maxLength="63" value={minimumExpense} onChange={handleChangeMinimumExpense} />
              {minimumExpenseError !== '' ? (
                <div className="invalid-feedback d-block">
                  {minimumExpenseError}
                </div>
              ) : null}
            </div>
            <div className="button-bottom-row">
              <div className="button-bottom-right-div">
                <ButtonElement className="btn-custom-rounded btn-cancel mr-10 btn-lowercase" onClick={() => handleCancel()} id="cancel-recommendation-button" label={getLangValue(strings.CANCEL, lang)} />
                <ButtonElement className="btn-custom-rounded btn-submit btn-lowercase" onClick={() => handleSubmit()} label={getLangValue(strings.SUBMIT, lang)} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

export default ShopAddRecommandation;
