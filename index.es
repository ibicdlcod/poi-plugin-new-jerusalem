import React, { Component } from 'react'
import { Button, TextArea, ButtonGroup, Icon } from "@blueprintjs/core";
import { connect } from 'react-redux'
import { shell } from 'electron'
async function getData(data) {
  const url = "http://127.0.0.1:3411";
  try {
    const response = await fetch(url, {
      method: "POST",
      body: data
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.text();
    return result;
  } catch (error) {
    let errorStr = "错误: ";
    return errorStr + error.message;
  }
}
export const windowMode = false;
export const reactClass = connect(state => ({
    nickname: state.info.basic.api_nickname,
    hqlv: state.info.basic.api_level,
    ships: state.info.ships,
    equips: state.info.equips
}))(class view extends Component {
    constructor(props) {
        super(props);
        this.handleActivityAirbaseChange = this.handleActivityAirbaseChange.bind(this);
    }

    state = { result: "", sresponse: "" };

    exportFleet = () => {
        //读取舰队信息
        const fleets = this.props.fleets;
        //读取船只信息
        const ships = this.props.ships;
        //读取装备信息
        const equips = this.props.equips;
        //初始化字符串
        let result = `{"version": 0,"nickname":"${this.props.nickname}","hqlv":${this.props.hqlv},`;

        result += `"ships":{`
        let j = 0
        //遍历舰队中的中船只
        for (let shipkey in ships) {
            const ship = ships[shipkey];
            result += `"s${j + 1}":{"id":${ship.api_ship_id},"exp":${ship.api_exp[0]},"luck":${ship.api_lucky[0]}},`;
            j = j + 1
        }
        //去除最后的逗号并且补上json字符串的后括号
        if (result.charAt(result.length - 1) == ',') {
            result = result.slice(0, result.length - 1) + `}`
        } else {
            result += `}`
        }
        j = 0
        result += `,"equips":{`
        for (let equipkey in equips) {
            const equip = equips[equipkey];
            if(equip.api_alv) {
                result += `"e${j + 1}":{"id":${equip.api_slotitem_id},"exp":${equip.api_alv},"star":${equip.api_level}},`;
            }
            else {
                result += `"e${j + 1}":{"id":${equip.api_slotitem_id},"star":${equip.api_level}},`;
            }
            j = j + 1
        }
        //去除最后的逗号并且补上json字符串的后括号
        if (result.charAt(result.length - 1) == ',') {
            result = result.slice(0, result.length - 1) + `}`
        } else {
            result += `}`
        }
        //去除最后的逗号并且补上json字符串的后括号
        if (result.charAt(result.length - 1) == ',') {
            result = result.slice(0, result.length - 1) + `}`
        } else {
            result += `}`
        }
        //更新result
        this.setState({ result })
        return result;
    }

    exportJervis = () => { 
	document.getElementById("demo").innerHTML = "导出中...";
        const result = this.exportFleet()
        //shell.openExternal(`https://jervis.vercel.app/zh-CN/?predeck=${result}`)
        getData(result).then(
	    function(value) {
	        document.getElementById("demo").innerHTML = value;
	    },
	    function(error) {
	        document.getElementById("demo").innerHTML = "导出失败";
	    }
	);
    }
    
    handleActivityAirbaseChange = (event) => {
        const value = event.target.checked;
        this.setState({activityAirbaseOnly: value});
    }

    render() {
        const result = this.state.result;
        const sresponse = this.state.sresponse;
        return (
            <div style={{ marginLeft: "10px" }}>
                <ButtonGroup>
                    <Button onClick={this.exportJervis}>
                        导出至新游
                    </Button>
                </ButtonGroup>
                <h2>舰队导出状态：</h2>
		<p id="demo">未导出</p>
            </div>
        )
    }
})
