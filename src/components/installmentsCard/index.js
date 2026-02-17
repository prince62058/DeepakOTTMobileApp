import { View, Text } from 'react-native';
import React from 'react';
import styles from './styles';
import MainText from '../MainText';
import { SIZES } from '../../constants';
import { getStatusStyle } from '../../utils/getStyle';
import { dateFormate } from '../../utils/formating/date';
import { fontSize } from '../../utils/fontSize';

const InstallmentCard = ({
  date = '04 sep 2025',
  installId = '199',
  cash = '6,500',
  status = 'active',
  item,
  index,
}) => {
  const statusStyle = getStatusStyle(status);

  return (
    <View style={styles.customView}>
      <View style={[styles.flex, { justifyContent: 'space-between' }]}>
        <View style={styles.left}>
          <MainText style={styles.text}>Date</MainText>
          <MainText style={styles.boldText}>
            {dateFormate(item?.dueDate || item?.date || date)}
          </MainText>
        </View>
        <View style={styles.right}>
          <MainText style={styles.text}>Installment No</MainText>
          <MainText style={styles.boldText}>{index + 1}</MainText>
        </View>
      </View>
      <View style={[styles.flex, { marginTop: SIZES.height * 0.01 }]}>
        {(() => {
          const currentStatus = item?.status || status;
          const isOverdue =
            currentStatus === 'OVERDUE' || currentStatus === 'Overdue';
          const baseAmount = Number(item?.amount || item?.cash || cash || 0);
          const lateFee = Number(item?.lateFee || 0);
          const bounceFee = Number(item?.bounceFee || 0);
          const totalAmount = isOverdue
            ? baseAmount + lateFee + bounceFee
            : baseAmount;

          return (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <MainText style={styles.cashText}>{totalAmount}</MainText>
                <MainText style={styles.cash}> cash</MainText>
              </View>
              {isOverdue && (lateFee > 0 || bounceFee > 0) && (
                <MainText
                  style={{
                    fontSize: fontSize(10),
                    color: 'red',
                    fontFamily: 'Inter-Medium',
                    marginTop: 2,
                  }}
                >
                  (+ ₹{lateFee + bounceFee} Additional Fee)
                </MainText>
              )}
            </View>
          );
        })()}
      </View>
      <View style={styles.statusContainer}>
        <MainText style={styles.remarkText}>Remarks:</MainText>
        <View
          style={[
            styles.statusBox,
            { backgroundColor: statusStyle.backgroundColor },
          ]}
        >
          <MainText style={styles.status}>{item?.status}</MainText>
        </View>
      </View>
    </View>
  );
};

export default InstallmentCard;
