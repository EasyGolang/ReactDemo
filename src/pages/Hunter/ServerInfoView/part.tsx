/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';

import { HunterServer, startHunterServer } from '@/api/hunter';
import { Button, Modal, Badge, Tooltip } from 'antd';
import { Link } from 'react-router-dom';

import { SyncOutlined, SettingOutlined } from '@ant-design/icons';
import { StoreUpdate } from '@/store';

import { AuthModal } from '@/components/AuthModal';
import { mStorage, $lg } from '@/utils/utils';

import { SysStar, SysStop } from '@/components/HunterOperate';

const ShellAbout = React.lazy(() => import('./ShellAbout'));

export interface PropsType {
  data: HunterServer;
  status?: number;
  event?: Function;
  config?: any;
}

export const Title = (props: PropsType) => {
  const dispatch = React.useContext(StoreUpdate);
  let topBarBtn = mStorage.get('topBarBtn');
  if (topBarBtn) {
    topBarBtn = { ...topBarBtn };
  } else {
    topBarBtn = {};
  }

  const ServerInfo = props.data;
  const Status = props.status;
  const config = props.config;

  const DataCenterConfig = mStorage.get('ping');
  const newVersion = DataCenterConfig.HunterVersion;

  const nowVersion = $lg(config, 'AppPackage.Version', '');

  const isAreVersion = newVersion === nowVersion;

  const [visible, setVisible] = React.useState(false);

  const AddTopBar = () => {
    if (ServerInfo.HunterServerID) {
      topBarBtn[`Btn_${ServerInfo.HunterServerID}`] = {
        ...config,
        ...ServerInfo,
        link: `/hunter/info/${ServerInfo.HunterServerID}`,
      };
    }
    mStorage.set('topBarBtn', topBarBtn);
    setVisible(false);
    dispatch({ type: 'TopBarShow' });
  };

  const RemoveTopBar = () => {
    delete topBarBtn[`Btn_${ServerInfo.HunterServerID}`];

    mStorage.set('topBarBtn', topBarBtn);
    setVisible(false);
    dispatch({ type: 'TopBarShow' });
  };

  return (
    <h3 className="ServerInfo_title">
      <div className="ServerInfo_host">
        <span>{`${ServerInfo.Host}:${ServerInfo.Port}`}</span>
        {Status === 1 && (
          <Badge dot={!isAreVersion}>
            <SettingOutlined
              className="HunterSet"
              onClick={() => {
                setVisible(true);
              }}
            />
          </Badge>
        )}
      </div>
      <div className="ServerInfo_note">
        Note: <br />
        {ServerInfo.Note}
      </div>
      <Modal
        title=""
        visible={visible}
        footer={null}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <div className="ServerInfoOpt">
          <div>
            <div className="ServerInfoOpt__hint">???????????????{nowVersion}</div>
            <div className="ServerInfoOpt__hint new">???????????????{newVersion}</div>
            {!isAreVersion && (
              <div className="ServerInfoOpt__hint">
                ????????????<span className="lineHeight">???????????????</span>?????????
                <Link to="/about/release_notes" className="lineHeight">
                  ????????????????????????
                </Link>
              </div>
            )}
          </div>

          <div className="btnWrapper">
            <SysStar {...props} />
            <SysStop {...props} />

            {topBarBtn[`Btn_${ServerInfo.HunterServerID}`] ? (
              <Button className="AddTop" size="small" block onClick={RemoveTopBar}>
                ????????????????????????
              </Button>
            ) : (
              <Button className="AddTop" size="small" block onClick={AddTopBar}>
                ???????????????????????????
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </h3>
  );
};

export const Status = (props: PropsType) => {
  const { status, data, event } = props;
  const dispatch = React.useContext(StoreUpdate);

  const [shellUrl, setShellUrl] = React.useState('');

  React.useEffect(() => {
    const deployShell = mStorage.get(`Shell_${data.HunterServerID}`);
    if (deployShell) {
      setShellUrl(deployShell);
    }
    return () => {};
  }, [data.HunterServerID]);

  const deployFunc = async () => {
    AuthModal({
      Title: '???????????????',
      Info: '?????? Hunter ??????',
      async OkBack(val) {
        dispatch({ type: 'LoadOpen' });
        const res = await startHunterServer({
          HunterServerID: data.HunterServerID,
          Password: val.Password,
        });
        dispatch({ type: 'LoadClose' });

        if (res.Code === 9 && res.Data?.Url) {
          setShellUrl(res.Data.Url);
          mStorage.set(`Shell_${data.HunterServerID}`, res.Data.Url);
        }

        if (event) {
          event('StatusUpdate', res.Code);
          return;
        }
      },
    });
  };

  if (!status) {
    return (
      <div className="ServerInfo_Status">
        <SyncOutlined spin />
        <div className="ServerInfo_hint">??????????????????????????????</div>
      </div>
    );
  }

  if (shellUrl) {
    return (
      <div className="ServerInfo_Status">
        <ShellAbout url={shellUrl} data={data} />
      </div>
    );
  }

  if (status < 0) {
    return (
      <div className="ServerInfo_Status">
        <div className="ServerInfo_hint">????????????????????????, ???????????????:</div>
        <Button type="primary" onClick={deployFunc}>
          ???????????? Hunter ??????
        </Button>
      </div>
    );
  }

  return null;
};
