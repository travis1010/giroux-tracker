import React from 'react';
import './GoogleAd.css';

export default class GoogleAd extends React.Component {
  componentDidMount () {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }

render () {
    return (
      <ins className="adsbygoogle"
      data-ad-client="ca-pub-3617031307909656"
      data-ad-slot="6821274629">
     </ins>
    );
  }
}