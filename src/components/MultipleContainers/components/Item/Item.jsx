import React, { useEffect } from "react";
import classNames from "classnames";

import { Handle, Remove } from "./components";

import styles from "./Item.module.scss";
import { Stack, Typography, Grid } from "@mui/material";
import { formatAmount } from "../../../../utils/format-amout";
// import CountdownTimer from "../../../specialOffer/liveCountDownComponent";
import CountdownTimerCampaign from "../../../specialOffer/liveContDownComponentCampaign";
import { useSelector } from "react-redux";



export const Item = React.memo(
  React.forwardRef(
    (
      {
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        height,
        index,
        listeners,
        onRemove,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        data,
        onclickItem,
        ...props
      },
      ref
    ) => {
      const user = useSelector((state) => state.user.data)


      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = "grabbing";

        return () => {
          document.body.style.cursor = "";
        };
      }, [dragOverlay]);

      return renderItem ? (
        renderItem({
          dragOverlay: Boolean(dragOverlay),
          dragging: Boolean(dragging),
          sorting: Boolean(sorting),
          index,
          fadeIn: Boolean(fadeIn),
          listeners,
          ref,
          style,
          transform,
          transition,
          value,
          data
        })
      ) : (
        <li
          className={classNames(
            styles.Wrapper,
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            dragOverlay && styles.dragOverlay
          )}
          style={
            {
              ...wrapperStyle,
              transition: [transition, wrapperStyle?.transition]
                .filter(Boolean)
                .join(", "),
              "--translate-x": transform
                ? `${Math.round(transform.x)}px`
                : undefined,
              "--translate-y": transform
                ? `${Math.round(transform.y)}px`
                : undefined,
              "--scale-x": transform?.scaleX
                ? `${transform.scaleX}`
                : undefined,
              "--scale-y": transform?.scaleY
                ? `${transform.scaleY}`
                : undefined,
              "--index": index,
              "--color": color
            }
          }
          ref={ref}
        >


          {
            data?.service ?
              <Stack
                flex={1}
                width={'100%'}
                flexDirection={'row'}
                justifyContent={'space-between'}
                sx={{
                  border: "1.5px solid #D9D9D9",
                  borderRadius: '15px',
                  paddingLeft: 2,
                  paddingRight: 2,
                }}
                className={classNames(
                  styles.Item,
                  dragging && styles.dragging,
                  handle && styles.withHandle,
                  dragOverlay && styles.dragOverlay,
                  disabled && styles.disabled,
                )}
              >
                <Stack
                  flexDirection={'row'}
                  justifyContent={'flex-start'}
                  alignItems={'center'}
                  sx={{ width: '35%' }}
                >
                  {handle ? <Handle {...handleProps} {...listeners} item={true} /> : null}

                  <Stack flex={1} flexDirection={'row'} justifyContent={'center'} alignItems={'center'} sx={{ height: '40px', cursor: 'pointer' }} onClick={() => onclickItem(data)}>

                    <Typography
                      variant="body1"
                      color="black"
                      sx={{
                        pl: 0, width: '100%',
                        maxWidth: 190,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>  {data?.service?.name}</Typography>
                  </Stack>

                </Stack>

                <Stack
                  flexDirection={'row'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  flex={1}
                  sx={{
                    height: '40px',
                    width: '20%',
                    // mr: 1,
                    cursor: 'pointer'

                  }}
                  onClick={() => onclickItem(data)}
                >
                  <CountdownTimerCampaign createdAt={data?.end_datetime} />
                </Stack>

                <Stack flexDirection={'row'} justifyContent={'center'} alignItems={'center'} sx={{ width: '15%', height: '40px', cursor: 'pointer' }} onClick={() => onclickItem(data)}>
                  <Typography
                    variant="body1"
                    sx={{
                      //  width: 150,
                      fontWeight: 400,
                      // fontSize: '20px',
                      color: '#D30000',
                      //  marginLeft: 10,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}>
                    {`${data?.service?.special_percentage}%`}
                  </Typography>
                </Stack>

                <Stack
                  flexDirection={'row'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  sx={{
                    width: '15%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    height: '40px',
                    cursor: 'pointer'

                  }}
                  onClick={() => onclickItem(data)}
                >

                  <Typography
                    variant="body1"
                    sx={{
                      // width: 140,
                      fontWeight: 400,
                      // fontSize: '20px',
                      color: '#A0A0A0',
                      marginLeft: 2,
                      textDecorationLine: 'line-through',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',

                    }}
                    onClick={() => onclickItem(data)}
                  >
                    {`₹${data.service?.price}`}
                  </Typography>
                </Stack>

                <Stack
                  flexDirection={'row'}
                  justifyContent={'center'}
                  alignItems={'center'}

                  sx={{
                    width: '15%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    height: '40px',
                    mr: 2,
                    cursor: 'pointer'
                  }}
                  onClick={() => onclickItem(data)}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      // width: 140,
                      fontWeight: 400,
                      // fontSize: '20px',
                      color: '#367B3D',
                      marginLeft: 2,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      mr: 1
                    }}>
                    {`₹${data.service?.special_price}`}
                  </Typography>
                </Stack>

                {onRemove ? (
                  <Remove className={styles.Remove} onClick={onRemove} />
                ) : null}

              </Stack>
              :
              data?.template ?
                <Stack
                  flex={1}
                  width={'100%'}
                  flexDirection={'row'}
                  justifyContent={'space-between'}
                  sx={{
                    border: "1.5px solid #D9D9D9",
                    borderRadius: '15px',
                    paddingLeft: 2,
                    paddingRight: 2,
                  }}
                  className={classNames(
                    styles.Item,
                    dragging && styles.dragging,
                    handle && styles.withHandle,
                    dragOverlay && styles.dragOverlay,
                    disabled && styles.disabled,
                  )}
                >
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'flex-start'}
                    alignItems={'center'}
                    sx={{ width: '100%' }}
                  >
                    {handle ? <Handle {...handleProps} {...listeners} item={true} /> : null}

                    <Stack flex={1} flexDirection={'row'} justifyContent={"flex-start"} alignItems={'center'} sx={{ height: '40px', cursor: 'pointer' }} onClick={() => onclickItem(data)}>
                      <Typography
                        variant="body1"
                        color="black"
                        sx={{
                          pl: 1, width: '100%',
                          maxWidth: 400,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                        {data?.name}
                      </Typography>
                    </Stack>

                  </Stack>

                  {onRemove ? (
                    <Remove className={styles.Remove} onClick={onRemove} />
                  ) : null}

                </Stack>
                :
                <Stack flex={1} width={'100%'} flexDirection={'row'} justifyContent={'space-between'} sx={{ border: "1.5px solid #D9D9D9", borderRadius: '15px', paddingLeft: 2, paddingRight: 2, pt: 0 }} className={classNames(
                  styles.Item,
                  dragging && styles.dragging,
                  handle && styles.withHandle,
                  dragOverlay && styles.dragOverlay,
                  disabled && styles.disabled,
                )}>
                  <Stack flex={0.5} flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                    {handle ? <Handle {...handleProps} {...listeners} item={true} /> : null}
                    <Stack flex={1} flexDirection={'row'} justifyContent={'center'} alignItems={'center'} sx={{ height: '40px', cursor: 'pointer' }} onClick={() => onclickItem(data)}>

                      <Typography
                        variant="body1"
                        color="black"
                        sx={{
                          pl: 2, width: '100%',
                          maxWidth: 280,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}> {data?.name}</Typography>
                    </Stack>
                  </Stack>


                  <Stack flex={0.25} flexDirection={'row'} justifyContent={'center'} alignItems={'center'} sx={{ height: '40px', cursor: 'pointer' }} onClick={() => onclickItem(data)}>
                    <Typography variant="body1" color="black" sx={{ ml: 2 }}> {data?.duration_text}</Typography>
                  </Stack>
                  <Stack flex={0.25} flexDirection={'row'} justifyContent={'center'} alignItems={'center'} sx={{ height: '40px', mr: 2, cursor: 'pointer' }} onClick={() => onclickItem(data)}>
                    <Typography variant="body1" color="black" sx={{ ml: 2 }}> {formatAmount(data?.price)}</Typography>
                  </Stack>
                  {(onRemove && (user?.settings.crud_services || user?.role === "ADMIN")) ? (
                    <Remove className={styles.Remove} onClick={onRemove} />
                  ) : null}

                </Stack>
          }



        </li>
      );
    }
  )
);
