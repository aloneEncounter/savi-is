/*==============================================================*/
/* Table: SYS_ORG                                               */
/*==============================================================*/
create table SYS_ORG
(
   SO_CODE              varchar(64) not null comment '全编号(父编码+自身编号)',
   SO_THIS_CODE         varchar(4) comment '自身编号',
   SO_PARENT_CODE       varchar(64) comment '父值',
   SO_LAYERS            int default 0 comment '当前层数',
   SO_ORDER             int comment '排序',
   SO_NAME              varchar(64) comment '名称',
   SO_TYPE              tinyint comment '机构类型，1机构，2部门，3室',
   SO_SET_UP_DATE       varchar(10) comment '成立日期',
   SO_SUMMARY           varchar(1024) comment '简介',
   primary key (SO_CODE)
);

/*==============================================================*/
/* Table: SYS_ORG_USER                                          */
/*==============================================================*/
create table SYS_ORG_USER
(
   USER_CODE            varchar(50) not null comment '用户名',
   SO_CODE              varchar(64) not null comment '全编号(父编码+自身编号)',
   SOU_ORDER            int,
   primary key (USER_CODE, SO_CODE)
);

/*==============================================================*/
/* Table: SYS_PERMISSIONS                                       */
/*==============================================================*/
create table SYS_PERMISSIONS
(
   SP_TYPE              int not null comment '类型（1角色，2机构，3岗位，4用户）',
   SP_CODE2             varchar(50) not null comment '角色或用户主键',
   SP_SM_CODE           varchar(32) not null comment '代码',
   SP_ORDER             int comment '序',
   SP_STATUS            int comment '状态（0=未配置，1=启用，2禁用）',
   primary key (SP_SM_CODE, SP_CODE2, SP_TYPE)
);

/*==============================================================*/
/* Table: SYS_POST                                              */
/*==============================================================*/
create table SYS_POST
(
   SP_CODE              varchar(50) not null comment '角色或用户主键',
   SP_THIS_CODE         varchar(8) comment '自身编号',
   SP_PARENT_CODE       varchar(64) comment '父编码',
   SP_LAYERS            int comment '当前层数',
   SP_ORDER             int comment '序',
   SP_NAME              varchar(64) comment '岗位名称',
   SP_DESCRIPTION       varchar(1024) comment '岗位职责',
   SP_DEMAND            text comment '岗位招聘信息',
   SP_TYPE              int comment '类型（1角色，2机构，3岗位，4用户）',
   primary key (SP_CODE)
);

/*==============================================================*/
/* Table: SYS_POST_USER                                         */
/*==============================================================*/
create table SYS_POST_USER
(
   USER_CODE            varchar(50) not null comment '用户名',
   SP_CODE              varchar(50) not null comment '角色或用户主键',
   SPU_ORADE            int,
   primary key (USER_CODE, SP_CODE)
);

/*==============================================================*/
/* Table: SYS_ROLES                                             */
/*==============================================================*/
create table SYS_ROLES
(
   SR_CODE              varchar(40) not null comment '角色代码',
   SR_NAME              varchar(50) comment '角色名称',
   SR_DESCRIPTION       varchar(256) comment '角色备注',
   primary key (SR_CODE)
);

alter table SYS_ROLES comment '角色';

/*==============================================================*/
/* Table: SYS_ROLE_USER                                         */
/*==============================================================*/
create table SYS_ROLE_USER
(
   SR_CODE              varchar(40) not null comment '角色代码',
   USER_CODE            varchar(50) not null comment '用户名',
   SRU_ORDER排序          int comment '序号',
   primary key (SR_CODE, USER_CODE)
);

alter table SYS_ROLE_USER comment '用户角色关系';

/*==============================================================*/
/* Table: SYS_USER                                              */
/*==============================================================*/
create table SYS_USER
(
   USER_CODE            varchar(50) not null comment '用户名',
   SUS_CODE             varchar(20) comment '分类编码',
   USER_NAME            varchar(256) comment '用户姓名',
   PASS                 varchar(128) not null comment '密码',
   LAST_PASS_CHANGED_DATE datetime comment '最后密码更改时间',
   LAST_LOCKOUT_DATE    datetime comment '最后一次锁帐号的时间',
   FAILED_PASS_COUNT    int comment '密码失败尝试次数',
   LOCKED_OUT           bool comment '是否锁住（false未锁住，true锁住）',
   ENABLED              bool comment '是否已核审（true可用，false不可用）',
   primary key (USER_CODE)
);



alter table SYS_USER comment '用户信息';

/*==============================================================*/
/* Table: SYS_USER_PARAMS                                       */
/*==============================================================*/
create table SYS_USER_PARAMS
(
   USER_CODE            varchar(50) not null comment '用户名',
   SUP_KEY              varchar(20) not null comment '键值',
   SUP_TYPE             varchar(20) comment '参数类型,opinion:常用意见',
   SUP_INDEX            int comment '序号排序用',
   SUP_VALUE_INT        int comment '值1 整形',
   SUP_VALUE_FLOAT      float comment '值2浮点',
   SUP_VALUE_STR        varchar(1024) comment '值3字符串',
   primary key (USER_CODE, SUP_KEY)
);

alter table SYS_USER_PARAMS comment '用户其他参数';

/*==============================================================*/
/* Table: SYS_USER_SORT                                         */
/*==============================================================*/
create table SYS_USER_SORT
(
   SUS_CODE             varchar(20) not null comment '分类编码',
   SUS_NAME             varchar(64) comment '分类名称',
   SUS_LEVEL            int comment '等级，用于范围级别判断',
   SUS_PASS_CHANGE_CYCLE smallint comment '密码更改周期， 0无',
   SUS_PASS_COMPLEXITY  smallint comment '密码复杂度，0无',
   SUS_PASS_MIN_LEN     smallint comment '密码最小长度',
   SUS_DISABLE          bool comment '是否禁用',
   primary key (SUS_CODE)
);

alter table SYS_USER_SORT comment '用户分类';

alter table SYS_ORG_USER add constraint FK_SYS_ORG_USER foreign key (USER_CODE)
      references SYS_USER (USER_CODE) on delete restrict on update restrict;

alter table SYS_ORG_USER add constraint FK_SYS_ORG_USER2 foreign key (SO_CODE)
      references SYS_ORG (SO_CODE) on delete restrict on update restrict;

alter table SYS_POST_USER add constraint FK_SYS_POST_USER foreign key (USER_CODE)
      references SYS_USER (USER_CODE) on delete restrict on update restrict;

alter table SYS_POST_USER add constraint FK_SYS_POST_USER2 foreign key (SP_CODE)
      references SYS_POST (SP_CODE) on delete restrict on update restrict;

alter table SYS_ROLE_USER add constraint FK_SU02 foreign key (USER_CODE)
      references SYS_USER (USER_CODE) on delete restrict on update restrict;

alter table SYS_ROLE_USER add constraint FK_SU03 foreign key (SR_CODE)
      references SYS_ROLES (SR_CODE) on delete restrict on update restrict;

alter table SYS_USER add constraint FK_SU04 foreign key (SUS_CODE)
      references SYS_USER_SORT (SUS_CODE) on delete restrict on update restrict;

alter table SYS_USER_PARAMS add constraint FK_SU01 foreign key (USER_CODE)
      references SYS_USER (USER_CODE) on delete restrict on update restrict;


/*==============================================================*/
/* 添加一管理员用户                                             */
/*==============================================================*/

INSERT INTO SYS_ROLES VALUES ('SysAdmins', '系统管理员', '系统管理员');
INSERT INTO SYS_ROLES VALUES ('SysDefault', '系统默认权限', '系统默认权限');

INSERT INTO sys_user_sort VALUES ('01', '非密',1, 0, 0, 0, 0);

//密码 password
INSERT INTO sys_user VALUES ('admin', '01', '管理员', '{bcrypt}$2a$10$PX9iMb0ATapZPHz2tmNe5.mO1TM3.3ZDtVcuwHEsc.FinUzGAkOB.', CURRENT_TIMESTAMP(), NULL, 0, 0, 1);

INSERT INTO SYS_ROLE_USER VALUES ('SysAdmins', 'admin', 1);