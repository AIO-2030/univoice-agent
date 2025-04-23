/**
 * @vitejs/plugin-react uses React Refresh
 * @refresh reset
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import style from './bottom-menu.module.scss';

const BottomMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const handleClickCreator = () => {
    // TODO
  };

  return (
    <div className={style.btm}>
      <div className={style.btmWrapper}>
        <div className={`${style.btmPart} ${style.leftbg}`}>
          {
            location.pathname ==='/' ? (
              <div className={`${style.menu} ${style.active}`}>
                <div className={style.imgHome}></div>
                <div className={style.txt}>Home</div>
              </div>
            ) : (
              <div className={style.menu} onClick={() => handleClick('/')}>
                <div className={style.imgHome}></div>
                <div className={style.txt}>Home</div>
              </div>
            )
          }
          {
            location.pathname ==='/tasks' || location.pathname ==='/friends' ? (
              <div className={`${style.menu} ${style.active}`}>
                <div className={style.imgTask}></div>
                <div className={style.txt}>Task</div>
              </div>
            ) : (
              <div className={style.menu} onClick={() => handleClick('/tasks')}>
                <div className={style.imgTask}></div>
                <div className={style.txt}>Task</div>
              </div>
            )
          }
        </div>
        <div className={style.centerMenu}>
          <div className={style.bgWraper}></div>
          <div className={style.btnCenter} onClick={() => handleClick('/sounds')}>
            <div className={style.logo}></div>
          </div>
        </div>
        <div className={`${style.btmPart} ${style.rightbg}`}>
          {
            location.pathname ==='/dashboard' ? (
              <div className={`${style.menu} ${style.active}`}>
                <div className={style.imgDashboard}></div>
                <div className={style.txt}>Dashboard</div>
              </div>
            ) : (
              <div className={style.menu} onClick={() => handleClick('/dashboard')}>
                <div className={style.imgDashboard}></div>
                <div className={style.txt}>Dashboard</div>
              </div>
            )
          }
          {
            location.pathname ==='/creator' ? (
              <div className={`${style.menu} ${style.active}`}>
                <div className={style.imgCreator}></div>
                <div className={style.txt}>Creator</div>
              </div>
            ) : (
              <div className={style.menu} onClick={() => handleClickCreator()}>
                <div className={style.imgCreator}></div>
                <div className={style.txt}>Creator</div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default BottomMenu;