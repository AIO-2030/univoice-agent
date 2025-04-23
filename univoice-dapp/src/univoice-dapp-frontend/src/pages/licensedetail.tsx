import { useEffect, useState } from 'react';
import style from './licensedetail.module.scss'
import { useNavigate, useParams } from 'react-router-dom';
import ImgNftThum from '@/assets/imgs/nft_thum.png'

function LicenseDetailPage() {
  const { id } = useParams();

  const navigate = useNavigate();
  const [licenseData, setLicenseData] = useState<any>([]);

  const handleBack = () => {
    window.history.back();
  };

  const getLicenseInfo = () => {
    let data = {
      collectionid: id,
      name: 'Univoice Listener',
      symbol: '',
      description: 'A liciense for identify as Univoice-Listener.<br/>Hot sale!',
      logo: 'https://bafybeibhnv326rmac22wfcxsmtrbdbzjzn5mviykq3rbt4ltqkqqfgobga.ipfs.w3s.link/thum.jpg',
      price: 100,
      price_unit: 'ICP'
    //   supply_cap: 0,
    //   total_supply: 0,
    //   allowed_transfers: true,
    //   expired_at: 0
    }
    setLicenseData(data);
  }

  useEffect(() => {
    getLicenseInfo();
  }, []);

  const catchNftImgFail = (event) => {
    event.target.src = ImgNftThum
  }

  const handleBuy = () => {
    // TODO
  }

  return (
    <div className="main-container">
      <div className={style.pgLicense}>
        <div className={`top-nav-bar ${style.topBar}`}>
          <div className={style.btnBack} onClick={handleBack}></div>
        </div>
        {licenseData.collectionid &&
        <div className={style.license}>
          <div className={style.mainImg}>
            <div className={`${style.nftImg} aspect-ratio-1-1`}>
              <div className={`${style.nft_wrap} aspect-ratio-wrap`}>
                <img className={`img-fixed ${style.img}`} src={licenseData.logo} onError={catchNftImgFail} />
              </div>
            </div>
          </div>

          <div className={style.infoPanel}>
            <div className={style.infoPanelWrapper}>
              <div className={style.r1}>
                <img className={`img-fixed ${style.thumbnail}`} src={licenseData.logo} onError={catchNftImgFail} />
                <div className={style.info}>
                  <div className={style.name}>{licenseData.name}</div>
                  <div className={style.no}>license # {licenseData.collectionid}</div>
                  <div className={style.sale}>On sale for <span className={style.price}>{licenseData.price} {licenseData.price_unit}</span></div>
                </div>
              </div>
              <div className={style.description}>
                <div className={style.title}>Description</div>
                <div className={style.ctx} dangerouslySetInnerHTML={{ __html: licenseData.description }}></div>
              </div>
            </div>
          </div>

          <div className={style.bottomBtn}>
            <div className={`btn-1 ${style.btnBuy}`} onClick={handleBuy}>Buy</div>
          </div>
        </div>
        }
      </div>
    </div>
  );
}
      
export default LicenseDetailPage;