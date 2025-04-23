import { Key, useState, useEffect } from 'react';

function PagingComponent( props:{ pageNum: number, totalPage: number, queryHandler: any } ) {
  const [pageItems, setPageItems] = useState<any>([]);
  
  useEffect(() => {
    let listItem:any = []
    // 当前页码和最大页码，取小值
    let maxLeNum = props.pageNum
    if (props.totalPage && props.totalPage > 0 && props.totalPage < maxLeNum) {
        maxLeNum = props.totalPage
    }
    let i = maxLeNum
    for (let j = 0; i > 0 && j < 3; i--, j++) {
      listItem.unshift({
        id: listItem.length,
        pageIdx: i,
        txt: i
      })
    }
    if (i > 1) {
      listItem.unshift({
        id: listItem.length,
        pageIdx: 0,
        txt: '...'
      })
    }
    if (i >= 1) {
      listItem.unshift({
        id: listItem.length,
        pageIdx: 1,
        txt: '1'
      })
    }

    let maxGtNum = (props.totalPage && props.totalPage > 0) ? props.totalPage : props.pageNum + 3
    for (i = maxLeNum + 1; i <= props.pageNum + 3 && i <= maxGtNum; i++) {
      listItem.push({
        id: listItem.length,
        pageIdx: i,
        txt: i
      })
    }
    if (i < maxGtNum) {
      listItem.push({
        id: listItem.length,
        pageIdx: 0,
        txt: '...'
      })
    }
    if (i <= maxGtNum) {
      listItem.push({
        id: listItem.length,
        pageIdx: maxGtNum,
        txt: maxGtNum
      })
    }
    setPageItems(listItem)
  }, [props.pageNum]);

  return (
    <div className="paging">
      {props.pageNum > 1 && <div className="paging-item" onClick={() => {props.queryHandler(props.pageNum - 1)}}>&lt;</div>}
      {pageItems.map((el: { id: Key | null | undefined; pageIdx: number; txt: string }) => (
        el.pageIdx > 0 ?
        <div key={el.id} className={`paging-item ${props.pageNum === el.pageIdx ? 'paging-item-current' : ''}`} onClick={() => {props.queryHandler(el.pageIdx)}}>{el.txt}</div>
        :
        <div key={el.id} className={`paging-item paging-item-txt ${props.pageNum === el.pageIdx ? 'paging-item-current' : ''}`}>{el.txt}</div>
      ))}
      {props.pageNum > 0 && !(props.totalPage > 0 && props.totalPage <= props.pageNum) && <div className="paging-item" onClick={() => {props.queryHandler(props.pageNum + 1)}}>&gt;</div>}
    </div>
  )  
}

export default PagingComponent;