import React, { forwardRef } from "react";
import classNames from "classnames";

import { Handle, Remove } from "../Item";

import styles from "./Container.module.scss";
import { Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";



export const Container = forwardRef((
  {
    children,
    columns = 1,
    handleProps,
    horizontal,
    hover,
    onClick,
    onRemove,
    label,
    placeholder,
    style,
    scrollable,
    shadow,
    unstyled,
    groupData,
    id,
    onclickContainer,
    ...props
  },
  ref
) => {
  const Component = onClick ? "button" : "div";
  const user = useSelector((state) => state.user.data);

  return (
    <Component
      {...props}
      ref={ref}
      style={
        {
          ...style,
          "--columns": columns
        }
      }
      className={classNames(
        styles.Container,
        unstyled && styles.unstyled,
        horizontal && styles.horizontal,
        hover && styles.hover,
        placeholder && styles.placeholder,
        scrollable && styles.scrollable,
        shadow && styles.shadow
      )}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
    >
      {label ? (
        //  <Stack flex={1} flexDirection={'row'} justifyContent={'space-between'} >

        <div className={styles.Header}>
          <Stack
            flex={1}
            width={'100%'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
            sx={{
              border: "1.5px solid #D9D9D9",
              borderRadius: '13px',
              backgroundColor: groupData?.noSubGroup || groupData?.forJournal ? '#ffffff' : '#D9D9D9',
              paddingLeft: 2,
              paddingRight: 2,
              height: 40,
            }}
          >
            <Stack flexDirection={'row'} flex={1} justifyContent={'space-between'} alignItems={'center'}>
              {/* {id != '0' ?
                <Handle {...handleProps} />
                :
                <Stack height={40} width={30} />
              } */}
              {(id != '0' && groupData?.showDeleteIcon !== false) ?
                <Handle {...handleProps} />
                :
                <Stack height={40} width={30} />
              }

              <Stack flex={1} height={40} justifyContent={'center'} sx={{ cursor: 'pointer' }} onClick={() => onclickContainer(groupData)}>
                <Typography variant="body1" color="black" sx={{ ml: 2 }}>{groupData?.title}</Typography>
              </Stack>
            </Stack>
            {/* <Stack flex={1} flexDirection={'row'} justifyContent={'flex-end'} alignItems={'center'}> */}


            {/* {!groupData?.noSubGroup &&
              (((user?.settings.crud_service_groups || user?.role === "ADMIN") && onRemove) && id != '0') ?
              <Stack flexDirection={'row'} sx={{ ml: 1 }}>
                <Remove onClick={onRemove} />
              </Stack>
              :
              undefined
            } */}
            {
              !(groupData?.showDeleteIcon === false) && (
                (!groupData?.noSubGroup || groupData?.showDeleteIcon === false) &&
                ((user?.settings.crud_service_groups || user?.role === "ADMIN") && onRemove) && id != '0') ||
                groupData?.forJournal ?
                <Stack flexDirection={'row'} sx={{ ml: 1 }}>
                  <Remove onClick={onRemove} />
                </Stack>
                : undefined
            }
            {/* </Stack> */}
          </Stack>
          {/* <div className={styles.Actions}>
            
            </div> */}
          {/* {label}  */}

        </div>
        // </Stack>
      ) : null}
      {
        !groupData?.noSubGroup &&
        (placeholder ?
          children
          :
          <ul
          // style={{ padding: groupData?.forJournal ? 0 : null, margin: groupData?.forJournal ? 0 : null }}
          >
            {children}
          </ul>
        )
      }

    </Component>
  );
}
);